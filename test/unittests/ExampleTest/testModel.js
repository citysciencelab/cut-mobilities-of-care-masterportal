var testModul;

testModul = Backbone.Model.extend({
    defaults: {
        employees: []
    },
    giveCoffee: function (employee) {
        employee.coffeeCount++;
    },
    makeWork: function (employee) {
        employee.coffeeCount--;
    },
    getIsAwake: function (employee) {
        return employee.coffeeCount > 1;
    },
    getSleepingEmployeeNames: function () {
        return _.pluck(this.getEmployees().filter(function (employee) {
            return !this.getIsAwake(employee);
        }, this), "name");
    },
    // getter for employees
    getEmployeesByName: function (name) {
        return this.getEmployees().filter(function (employee) {
            return employee.name === name;
        }, this);
    },
    // getter for employees
    getEmployees: function () {
        return this.get("employees");
    },
    // setter for employees
    setEmployees: function (value) {
        this.set("employees", value);
    }
});

export default testModul;
