var customers;
var customerID;
var unfilteredCustomers;
var prevSortProperty;
var sortDirection;
var defaultTime = '07:00';

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
                addPetRow(pet);
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
        addPetRow(undefined);
        customerForm.style.display = 'block';
    }
    catch (e) {
        displayError('Error displaying Customer - ' + e.message);
    }
}
function closeCustomerForm() {
    document.getElementById("CustomerForm").style.display = 'none';
}
function addPetRow(pet) {
    let petTable = document.getElementById('PetTable');
    petTable.className = 'parentTable';
    let petBody = petTable.getElementsByTagName('tbody')[0];
    let petRow = petBody.insertRow(-1); 
    petRow.className = 'parentRow';  //This is the parent row for each pet
    let cellIndex = 0;
    petRow.insertCell(cellIndex);
    addElementToTableRow('PetID', 'input', 'hidden', undefined, false, undefined,  (pet !== undefined ? pet.ID : undefined), cellIndex, petRow);
    petRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetName', 'input', 'text', 'userInput', true, undefined, (pet !== undefined ? pet.Name : undefined), cellIndex, petRow).oninput = function () { petRowChanged(petRow); }
    petRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetType', 'select', undefined, 'userInput', true, petTypeListItems, (pet !== undefined ? pet.Type.ID : undefined), cellIndex, petRow).oninput = function () { petRowChanged(petRow); }
    petRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetDescription', 'input', 'text', 'userInput', true, undefined, (pet !== undefined ? pet.Description : undefined), cellIndex, petRow).oninput = function () { petRowChanged(petRow); }

    //Pet Tasks
    let petTaskTableRow = petBody.insertRow(-1);
    petTaskTableRow.className = 'childTableContainerRow';  //This is the child row for each pet that holds the PetTask table
    let petTaskTableCell = petTaskTableRow.insertCell(0);
    petTaskTableCell.colSpan = 4;
    let petTaskTable = document.createElement('table');
    petTaskTable.className = 'childTable';
    let addPetTaskBody = document.createElement('tbody');
    if (pet !== undefined) {
        for (petTask of pet.Tasks) {
            addPetTaskRow(petTask, addPetTaskBody);
        }
    } 
    addPetTaskRow(undefined, addPetTaskBody);
    petTaskTable.appendChild(addPetTaskBody);
    petTaskTableCell.appendChild(petTaskTable);
}
function petRowChanged(petRow) {
    tableRowChanged(petRow, addPetRow);
}
function addPetTaskRow(petTask, addPetTaskBody) {
    let petTaskRow = addPetTaskBody.insertRow(-1);
    petTaskRow.className = 'childRow';
    let cellIndex = 0;
    petTaskRow.insertCell(cellIndex);
    addElementToTableRow('PetTaskID', 'input', 'hidden', undefined, false, undefined, (petTask !== undefined ? petTask.ID : undefined), cellIndex, petTaskRow);
    petTaskRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetTaskPreferredTime', 'input', 'time', undefined, true, undefined, (petTask !== undefined ? petTask.PreferredTime : defaultTime), cellIndex, petTaskRow)
        .onchange = function () {
            defaultTime = this.value;
        }
    petTaskRow.insertCell(cellIndex += 1);
    addElementToTableRow('PetTaskDescription', 'input', 'text', 'userInput', true, undefined, (petTask !== undefined ? petTask.Description : undefined), cellIndex, petTaskRow)
        .oninput = function () {
            petTaskRowChanged(petTaskRow);
        }
}
function petTaskRowChanged(petTaskRow) {
    let petTaskBody = petTaskRow.parentElement;
    tableRowChanged(petTaskRow, function () { addPetTaskRow(undefined, petTaskBody) });
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
    let petBody = document.getElementById('PetTable').getElementsByTagName('tbody')[0];
    let petRows = petBody.querySelectorAll('tr.parentRow');
    let petTaskRows;
    let petTasks;
    let petTask;
    for (petRow of petRows) {      
        if (petRow.querySelectorAll("input.userInput[required]").length > 0) { //If row has required elements, then user has input values.  Let the required attribute handle data validation
            pet = {};
            pet.ID = petRow.querySelector('[name=PetID]').value;
            pet.Name = petRow.querySelector('[name=PetName]').value;
            pet.Type = { ID: petRow.querySelector('[name=PetType]').value } ;     
            pet.Description = petRow.querySelector('[name=PetDescription]').value;

            petTasks = [];
            petTaskRows = petRow.nextSibling.querySelectorAll('tr.childRow');
            for (petTaskRow of petTaskRows) {
                if (petTaskRow.querySelectorAll("input.userInput[required]").length > 0) {
                    petTask = {};
                    petTask.ID = petTaskRow.querySelector('[name=PetTaskID]').value;
                    petTask.PreferredTime = petTaskRow.querySelector('[name=PetTaskPreferredTime]').value;
                    petTask.Description = petTaskRow.querySelector('[name=PetTaskDescription]').value;
                    petTasks.push(petTask);
                }
            }
            pet.Tasks = petTasks;
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