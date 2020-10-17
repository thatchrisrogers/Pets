var customers;
var unfilteredCustomers;
var prevSortProperty;
var sortDirection;


function initCustomerView() {
    getCustomers(createCustomerTable);
    document.getElementById('CustomerForm').onsubmit = function (event) {
        event.preventDefault();
        saveCustomer();
        if (document.activeElement.id === 'SaveAndClose') {
            closeCustomerForm();
        }
    };
}
function createCustomerTable() {
    let table = document.getElementById("CustomerTable");
    table.removeChild(table.getElementsByTagName('tbody')[0]); //remove tbody first to delete any rows (empty table)
    tableBody = table.appendChild(document.createElement('tbody'));
    let tableRow;
    let tableCell;
    let element;
    for (customer of customers) {
        tableRow = tableBody.insertRow(-1);
        tableCell = tableRow.insertCell(0);
        element = document.createElement('input');
        element.type = 'hidden';
        element.name = 'CustomerID';
        element.value = customer.ID;
        tableCell.appendChild(element);
        element = document.createElement('label');
        element.innerHTML = customer.HouseholdName;
        tableCell.appendChild(element);
        tableCell = tableRow.insertCell(1);
        element = document.createElement('label');
        element.innerHTML = customer.Address;
        tableCell.appendChild(element);      
        tableRow.onclick = function () {
            let id = this.cells[0].querySelector('[name=CustomerID]').value;
            getCustomer(id, displayCustomerForm);
        }
    }
}
function displayCustomerForm(customer) {
    try {
        let customerForm = document.forms.namedItem("CustomerForm");
        if (customer !== null) {
            customerForm.ID.value = customer.ID;
            customerForm.HouseholdName.value = customer.HouseholdName;
            customerForm.Address.value = customer.Address;
            customerForm.Email.value = customer.Email;
        }
             
        customerForm.style.display = 'block';
    }
    catch (e) {
        displayError('Error displaying customer - ' + e.message);
    }
}
function closeCustomerForm() {
    document.getElementById("CustomerForm").style.display = 'none';
}
function getCustomers(callBackFunction, refresh) {
    if (customers === undefined || refresh) {
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', 'api/customer', true);
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 ) {            
                if (this.status === 200) {
                    customers = JSON.parse(this.responseText);
                    unfilteredCustomers = JSON.parse(this.responseText);
                    callBackFunction();
                }
                else {
                    displayError('Error getting customers', this);
                }
            }
        };
        xhttp.send();
        xhttp.onerror = function () {
            displayError('Error getting customers - onerror event');
        };
    } else {
        callBackFunction();
    }
}
function getCustomer(id, callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/customer/' + id, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                callBackFunction(JSON.parse(this.responseText));
            } else {
                displayError('Error getting customer', this);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function (e) {
        alert(e.message);
    }
}
function saveCustomer() {
    let formData = document.getElementById('CustomerForm');
    let customer = {};
    customer.ID = formData.ID.value;
    customer.HouseholdName = formData.HouseholdName.value;
    customer.Address = formData.Address.value;
    customer.Email = formData.Email.value;

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "api/customer", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 204) {
                displaySuccess('Customer saved');
                getCustomers(createCustomerTable, true);
            }
            else {
                displayError('Error saving customer', this);
            }
        }
    };
    xhttp.send(JSON.stringify(customer));
    xhttp.onerror = function () {
        displayError('Error saving customer - onerror event');
    };
}
function sortCustomers(sortProperty) {
    if (sortProperty === prevSortProperty) {
        if (sortDirection === 'asc') { sortDirection = 'desc'; } else { sortDirection = 'asc'; }
    } else { sortDirection = 'asc'; }
    customers = customers.sort(function (a, b) {
        if (sortDirection === 'asc') {
            return (a[sortProperty] > b[sortProperty]) ? 1 : ((a[sortProperty] < b[sortProperty]) ? -1 : 0);
            sortDirection = 'desc';
        } else {
            return (b[sortProperty] > a[sortProperty]) ? 1 : ((b[sortProperty] < a[sortProperty]) ? -1 : 0);
            sortDirection = 'asc';
        }
    });
    prevSortProperty = sortProperty;
    createCustomerTable();
}
function filterCustomers(filter) {
    filter = filter.toLowerCase();
    customers = unfilteredCustomers.filter(function (customer) {
        return customer.Address.toLowerCase().includes(filter) || customer.HouseholdName.toLowerCase().includes(filter);
    });
    createCustomerTable();
}