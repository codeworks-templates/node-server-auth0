import { logger } from "./Logger.js";
import { dbContext } from "../db/DbContext.js";

export function createOpenAPISpec(controllers) {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Auto Generated API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:' + process.env.PORT
      }
    ],
    paths: {}
  }
  const paths = {}

  const schemas = extractSchemaInfo();

  logger.log('Generating OpenAPI Spec', controllers.length);
  for (const controller of controllers) {
    const basePath = controller.mount;
    const stack = controller.router.stack;

    for (const layer of stack) {
      if (!layer.route) continue;

      const routePath = basePath + layer.route.path;
      const methods = Object.keys(layer.route.methods);
      const middlewares = layer.route.stack.map(mw => mw.handle.name || 'anonymousMiddleware');
      const handler = layer.route.stack[layer.route.stack.length - 1].handle;

      methods.forEach(method => {
        if (!paths[routePath]) paths[routePath] = {};

        const statusCodes = extractStatusCodes(handler);
        const requiredBody = extractRequiredBodyParams(handler);
        const responseStructure = extractResponseStructure(handler);

        let schemaName = Object.keys(schemas).find(s => routePath.includes(s.toLowerCase()));
        let responseSchema = schemaName ? schemas[schemaName] : responseStructure;

        paths[routePath][method] = {
          summary: `Handler: ${handler.name}`,
          description: `Middlewares: ${middlewares.join(', ')}`,
          requestBody: method !== 'get' && requiredBody.length
            ? {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: Object.fromEntries(requiredBody.map(f => [f, { type: "string" }])),
                  },
                },
              },
            }
            : undefined,
          responses: Object.fromEntries(statusCodes.map(code => [
            code,
            {
              description: `Response for status ${code}`,
              content: {
                "application/json": {
                  schema: { type: "object", properties: responseSchema }
                }
              }
            }
          ]))
        };
      });
    }
  }

  const openApiSchemas = {};
  for (const [name, schemaFields] of Object.entries(schemas)) {
    openApiSchemas[name] = {
      type: "object",
      properties: schemaFields
    };
  }

  spec.paths = paths;
  spec.components = { schemas: openApiSchemas };
  return spec;
}


function extractResponseStructure(handler) {
  const fnString = handler.toString();
  let responseStructure = {};
  const regex = /res\.(send|json)\(([^)]+)\)/g;
  let match;

  while ((match = regex.exec(fnString)) !== null) {
    let responseVar = match[2].trim();

    if (responseVar.startsWith('{') && responseVar.endsWith('}')) {
      try {
        responseStructure = JSON.parse(responseVar.replace(/(\w+):/g, '"$1":'));
      } catch (e) {
        responseStructure = "Unknown structure (complex inline object)";
      }
      return responseStructure;
    }

    if (responseVar.startsWith('"') || responseVar.startsWith("'")) {
      return { response: responseVar.replace(/^["']|["']$/g, '') };
    }

    const varRegex = new RegExp(`\\b${responseVar}\\s*=\\s*({[^}]+})`, 'g');
    const varMatch = varRegex.exec(fnString);
    if (varMatch) {
      try {
        responseStructure = JSON.parse(varMatch[1].replace(/(\w+):/g, '"$1":'));
      } catch (e) {
        responseStructure = "Unknown structure (complex variable object)";
      }
      return responseStructure;
    }

    return { response: `Unknown structure (variable: ${responseVar})` };
  }

  return responseStructure || {};
}

function extractRequiredBodyParams(handler) {
  const fnString = handler.toString();
  const requiredFields = new Set();
  const regex = /req\.body\.([a-zA-Z0-9_]+)/g;
  let match;

  while ((match = regex.exec(fnString)) !== null) {
    requiredFields.add(match[1]);
  }

  return Array.from(requiredFields);
}

function extractStatusCodes(handler) {
  const fnString = handler.toString();
  const statusCodes = [];
  const regex = /res\.status\((\d{3})\)/g;
  let match;

  while ((match = regex.exec(fnString)) !== null) {
    statusCodes.push(Number(match[1]));
  }

  return statusCodes.length ? statusCodes : [200];
}


function extractSchemaInfo() {
  const schemas = {};

  for (const modelName in dbContext) {
    const model = dbContext[modelName];
    if (!model || !model.schema) continue;

    const schemaInfo = {};

    for (const field in model.schema.paths) {
      const path = model.schema.paths[field];

      let fieldType = path.instance.toLowerCase();
      if (fieldType === 'objectid') fieldType = 'string';

      schemaInfo[field] = {
        type: fieldType,
        required: path.isRequired || false,
        default: path.defaultValue || undefined,
      };
    }

    const virtuals = model.schema.virtuals;
    for (const virtual in virtuals) {
      schemaInfo['{' + virtual + '}'] = {
        type: 'virtual',
        required: false,
        default: undefined,
      };
    }

    schemas[modelName] = schemaInfo;
  }

  return schemas;
}
