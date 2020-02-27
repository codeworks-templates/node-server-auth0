# Services

A service is where you want to put your business logic and calls to your server

> Example `CarsService`

```javascript
import store from "../store.js";
import Car from "../Models/Car.js";

const _SANDBOX_URL = "https://bcw-sandbox.herokuapp.com/api/cars/";
class CarsService {
  async getCars() {
    let results = await fetch(_SANDBOX_URL);
    let data = await results.json();
    let cars = data.data.map(c => new Car(c));
    cars.reverse();
    store.commit("cars", cars);
  }

  async createCar(carData) {
    let response = await fetch(_SANDBOX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(carData)
    });
    let data = await response.json();
    let newCar = new Car(data.data);
    store.State.cars.push(newCar);
    store.commit("cars", store.State.cars);
  }

  async updateCar(carData) {
    let response = await fetch(_SANDBOX_URL + carData._id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(carData)
    });
    let data = await response.json();
    let newCar = new Car(carData);

    let i = store.State.cars.findIndex(c => c._id == newCar._id);
    if (i != -1) {
      store.State.cars.splice(i, 1, newCar);
      store.commit("cars", store.State.cars);
    }
  }
  async deleteCar(id) {
    let response = await fetch(_SANDBOX_URL + id, {
      method: "DELETE"
    });
    let i = store.State.cars.findIndex(c => c._id == id);
    if (i != -1) {
      store.State.cars.splice(i, 1);
      store.commit("cars", store.State.cars);
    }
  }
}
// Singleton Services
const service = new CarsService();
export default service;
```
