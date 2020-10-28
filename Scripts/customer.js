var customers;
var customerID;
var unfilteredCustomers;
var prevSortProperty;
var sortDirection;

function initCustomerView() {
    getCustomers(createCustomerTable);
    document.getElementById('CustomerForm').onsubmit = function (event) {
        event.preventDefault();
        saveCustomer();
    };
}
function createCustomerTable() {
    let customerTable = document.getElementById("CustomerTable");
    customerTable.removeChild(customerTable.getElementsByTagName('tbody')[0]); //remove tbody first to delete any rows (emptycustomerTable)
    customerTableBody = customerTable.appendChild(document.createElement('tbody'));
    let customerTableRow;
    let tableCell;
    let element;
    for (customer of customers) {
        customerTableRow = customerTableBody.insertRow(-1);
        tableCell = customerTableRow.insertCell(0);
        element = document.createElement('input');
        element.type = 'hidden';
        element.name = 'CustomerID';
        element.value = customer.ID;
        tableCell.appendChild(element);
        element = document.createElement('label');
        element.innerHTML = customer.HouseholdName;
        tableCell.appendChild(element);
        tableCell = customerTableRow.insertCell(1);
        element = document.createElement('label');
        element.innerHTML = customer.Address;
        tableCell.appendChild(element);      
        customerTableRow.onclick = function () {
            customerID = this.cells[0].querySelector('[name=CustomerID]').value;
            getCustomer(customerID, displayCustomerForm);
        }
    }
}
function displayCustomerForm(customer) {
    try {
        let customerForm = document.forms.namedItem("CustomerForm");
        let petTable = document.getElementById("PetTable");
        if (customer !== null) {
            customerID = customer.ID;
            customerForm.HouseholdName.value = customer.HouseholdName;
            customerForm.Address.value = customer.Address;
            customerForm.Email.value = customer.Email;
            petTable.removeChild(petTable.getElementsByTagName('tbody')[0]); //remove tbody first to delete any rows (empty petTable)
            petTable.appendChild(document.createElement('tbody'));
            for (pet of customer.Pets) {
                addPetTableRow(pet);
            }
        }
        else { //Display empty Customer Form
            customerID = null;
            customerForm.HouseholdName.value = '';
            customerForm.Address.value = '';
            customerForm.Email.value = '';
            petTable.removeChild(petTable.getElementsByTagName('tbody')[0]);
            petTable.appendChild(document.createElement('tbody'));
        }
        addPetTableRow(undefined);
        customerForm.style.display = 'block';
    }
    catch (e) {
        displayError('Error displaying customer - ' + e.message);
    }
}
function closeCustomerForm() {
    document.getElementById("CustomerForm").style.display = 'none';
}
function addPetTableRow(pet) {
    let petTable = document.getElementById('PetTable');
    let petTableBody = petTable.getElementsByTagName('tbody')[0];
    let petTableRow = petTableBody.insertRow(-1); 
    let cellIndex = 0;
    petTableRow.insertCell(cellIndex);
    addElementToTableRow('PetID', 'hidden', false, (pet !== undefined ? pet.ID : undefined), cellIndex, petTableRow);
    petTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetName', 'text', true, (pet !== undefined ? pet.Name : undefined), cellIndex, petTableRow).onchange = function () { tableRowChanged(petTableRow); }
    petTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetDescription', 'text', true, (pet !== undefined ? pet.Description : undefined), cellIndex, petTableRow).onchange = function () { tableRowChanged(petTableRow); }
}
//function petTableElementChanged(petTable) {
//    //If an input in the Pet table changes, then check to see if all [required] inputs in the table have a value, and if so, add an empty row  
//    //if (validTableInputs(petTable) === 'some') {
//    //    makeAllTableInputsRequired(petTable);
//    //}
//    //if (validTableInputs(petTable) === 'all') {
//    //    addPetTableRow(undefined);     
//    //}

//}
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
function getCustomer(customerID, callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/customer/' + customerID, true);
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
    customer.ID = customerID;
    customer.HouseholdName = formData.HouseholdName.value;
    customer.Address = formData.Address.value;
    customer.Email = formData.Email.value;

    let pets = [];
    let pet;
    let petTableBody = document.getElementById('PetTable').getElementsByTagName('tbody')[0];
    let petTableRows = petTableBody.querySelectorAll('tr');
    for (let i = 0; i < petTableRows.length; i++) {
        if (allTableRowInputsAreValid(petTableRows[i])) {
            pet = {};
            pet.ID = document.getElementsByName('PetID')[i].value;
            pet.Name = document.getElementsByName('PetName')[i].value;
            pet.Description = document.getElementsByName('PetDescription')[i].value;
            pets.push(pet);
        }      
    }
    customer.Pets = pets;

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "api/customer", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 204) {
                displaySuccess('Customer saved');

                let customer = JSON.parse(this.responseText);
                if (document.activeElement.id === 'Save') {
                    displayCustomerForm(customer);  //If staying on the form, then refresh with fresh IDs passed back in the response.
                }
                else if (document.activeElement.id === 'SaveAndClose') {
                    closeCustomerForm();
                }

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