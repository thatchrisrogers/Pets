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
        element.innerHTML = customer.Name;
        tableCell.appendChild(element);
        tableCell = customerTableRow.insertCell(1);
        element = document.createElement('label');
        element.innerHTML = customer.Address;
        tableCell.appendChild(element); 
        tableCell = customerTableRow.insertCell(2);
        element = document.createElement('label');
        element.innerHTML = customer.PetNames
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
            customerForm.CustomerName.value = customer.Name;
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
            customerForm.CustomerName.value = '';
            customerForm.Address.value = '';
            customerForm.Email.value = '';
            petTable.removeChild(petTable.getElementsByTagName('tbody')[0]);
            petTable.appendChild(document.createElement('tbody'));
        }
        addPetTableRow(undefined);
        customerForm.style.display = 'block';
    }
    catch (e) {
        displayError('Error displaying Customer - ' + e.message);
    }
}
function closeCustomerForm() {
    document.getElementById("CustomerForm").style.display = 'none';
}
function addPetTableRow(pet) {
    let petTable = document.getElementById('PetTable');
    let petTableBody = petTable.getElementsByTagName('tbody')[0];
    let petTableRow = petTableBody.insertRow(-1); 
    petTableRow.className = 'petRow';  //This is the top row for each pet
    let cellIndex = 0;
    petTableRow.insertCell(cellIndex);
    addElementToTableRow('PetID', 'input', 'hidden', undefined, false, undefined,  (pet !== undefined ? pet.ID : undefined), cellIndex, petTableRow);
    petTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetName', 'input', 'text', 'userInput', true, undefined, (pet !== undefined ? pet.Name : undefined), cellIndex, petTableRow).oninput = function () { petTableRowChanged(petTableRow); }
    petTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetType', 'select', undefined, 'userInput', true, petTypeListItems, (pet !== undefined ? pet.Type.ID : undefined), cellIndex, petTableRow).oninput = function () { petTableRowChanged(petTableRow); }
    petTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetDescription', 'input', 'text', 'userInput', true, undefined, (pet !== undefined ? pet.Description : undefined), cellIndex, petTableRow).oninput = function () { petTableRowChanged(petTableRow); }

    //Pet Tasks
    petTableRow = petTableBody.insertRow(-1);
    let petTableCell = petTableRow.insertCell(0);
    petTableCell.colSpan = 4;
    let petTaskTable = document.createElement('table');
    petTaskTable.name = 'PetTaskTable';
    let petTaskTableBody = document.createElement('tbody');
    if (pet !== undefined) {
        for (petTask of pet.Tasks) {
            addPetTaskTableRow(petTask, petTaskTableBody);
        }
    } 
    addPetTaskTableRow(undefined, petTaskTableBody);
    petTaskTable.appendChild(petTaskTableBody);
    petTableCell.appendChild(petTaskTable);
}
function petTableRowChanged(petTableRow) {
    tableRowChanged(petTableRow, addPetTableRow);
}
function addPetTaskTableRow(petTask, petTaskTableBody) {
    //pet tasks - Can you use grid?
    let petTaskTableRow = petTaskTableBody.insertRow(-1);
    petTaskTableRow.className = 'petTasksRow';  //This is the bottom row for each pet
    let cellIndex = 0;
    petTaskTableRow.insertCell(cellIndex);
    addElementToTableRow('PetTaskID', 'input', 'hidden', undefined, false, undefined, (petTask !== undefined ? petTask.ID : undefined), cellIndex, petTaskTableRow);
    petTaskTableRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetTaskDescription', 'input', 'text', 'userInput', true, undefined, (petTask !== undefined ? petTask.Description : undefined), cellIndex, petTaskTableRow)
        .oninput = function () {
            petTaskTableRowChanged(petTaskTableRow);
        }
}
function petTaskTableRowChanged(petTaskTableRow) {
    let petTaskTableBody = petTaskTableRow.parentElement;
    tableRowChanged(petTaskTableRow, function () { addPetTaskTableRow(undefined, petTaskTableBody) });
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
                    displayError('Error getting Customers', this);
                }
            }
        };
        xhttp.send();
        xhttp.onerror = function () {
            displayError('Error getting Customers - onerror event');
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
                displayError('Error getting Customer', this);
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
    customer.Name = formData.CustomerName.value;
    customer.Address = formData.Address.value;
    customer.Email = formData.Email.value;

    let pets = [];
    let pet;
    let petTableBody = document.getElementById('PetTable').getElementsByTagName('tbody')[0];
    let petTableRows = petTableBody.querySelectorAll('tr.petRow');
    for (petTableRow of petTableRows) {      
        if (petTableRow.querySelectorAll("input.userInput[required]").length > 0) { //If row has required elements, then user has input values.  Let the required attribute handle data validation
            pet = {};
            pet.ID = petTableRow.querySelector('[name=PetID]').value;
            pet.Name = petTableRow.querySelector('[name=PetName]').value;
            pet.Type = { ID: petTableRow.querySelector('[name=PetType]').value } ;     
            //testType = {};
            //testType.ID = petTableRow.querySelector('[name=PetType]').value;
            //pet.Type = testType;
            pet.Description = petTableRow.querySelector('[name=PetDescription]').value;
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

                customer = JSON.parse(this.responseText);
                if (document.activeElement.id === 'Save') {
                    displayCustomerForm(customer);  //If staying on the form, then refresh with fresh IDs passed back in the response.
                }
                else if (document.activeElement.id === 'SaveAndClose') {
                    closeCustomerForm();
                }

                getCustomers(createCustomerTable, true);
                
            }
            else {
                displayError('Error saving Customer', this);
            }
        }
    };
    xhttp.send(JSON.stringify(customer));
    xhttp.onerror = function () {
        displayError('Error saving Customer - onerror event');
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
        return customer.Address.toLowerCase().includes(filter) || customer.Name.toLowerCase().includes(filter) || customer.PetNames.toLowerCase().includes(filter);
    });
    createCustomerTable();
}