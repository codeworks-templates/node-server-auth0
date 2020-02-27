# Controllers

Controllers are used to handle user interactions and rendering of viewmodels to the Document (DOM)

> Example `CarsController` Model

```javascript
import CarsService from "../Services/CarsService.js";
import store from "../store.js";

//Private
function _draw() {
  let cars = store.State.cars;
  let template = "";
  cars.forEach(car => (template += car.Template));
  document.getElementById("cars").innerHTML = template;
  console.log(cars);
}

//Public
export default class CarsController {
  constructor() {
    store.subscribe("cars", _draw);
  }

  async getCars() {
    try {
      await CarsService.getCars();
    } catch (error) {
      console.log(error);
    }
  }

  async createCar() {
    try {
      event.preventDefault();
      var form = document.forms.namedItem("car-form");
      let carData = {};
      new FormData(form).forEach((val, key) => (carData[key] = val));
      if (carData._id) {
        await CarsService.updateCar(carData);
      } else {
        await CarsService.createCar(carData);
      }
      form.reset();
    } catch (error) {
      console.log(error);
    }
  }
  async editCar(id) {
    let car = store.State.cars.find(c => c._id == id);
    let form = document.forms.namedItem("car-form");
    Object.keys(car).forEach(key => (form[key].value = car[key]));
  }

  async updateCar() {
    try {
      // @ts-ignore
      await CarsService.editCar();
    } catch (error) {
      console.log(error);
    }
  }

  async deleteCar(id) {
    try {
      await CarsService.deleteCar(id);
    } catch (error) {
      console.log(error);
    }
  }
}
```
