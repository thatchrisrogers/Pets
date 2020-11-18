var customerListItems = [];
var careProviderListItems = [];
var petTypeListItems = [];

function findQueryStringValueByKey(href, key) {
    let queryString = href.split('?')[1];
    let queryStringParams = [];
    let keyValues = queryString.split('&');
    for (let i = 0; i < keyValues.length; i++) {
        queryStringParams.push({ key: keyValues[i].split('=')[0], value: keyValues[i].split('=')[1] });
    }
    for (let i = 0; i < queryStringParams.length; i++) {
        if (queryStringParams[i]['key'] === key) {
            return queryStringParams[i]['value'];
        }
    }
    return null;
}
function initValidValues() {
    getValidValues('customer', customerListItems);
    getValidValues('careProvider', careProviderListItems);
    getValidValues('petType', petTypeListItems);
}
function getValidValues(apiName, validValues) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/' + apiName, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status === 200) {
            validValues.push({ ID: '', Name: '' });
            for (item of JSON.parse(this.responseText)) {
                validValues.push({ ID: item.ID, Name: item.Name });
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('getValidValues - onerror event');
    };
}
Object.prototype.isNullOrEmpty = function (value) {
    return (!value);  //Extend the native string prototype to return a boolean indicator for a valid value (not undefined, empty, etc)
}
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
Date.prototype.toISOLocaleString = function () {  //Extend the native Date prototype to return the ISO format for a date that is offset for local timezone
    return new Date(this.getTime() - (this.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
}

function displayError(errorMessage, response) {
    let message = document.getElementById('Message');
    message.className = 'message messageError';
    if (response !== undefined) {
        errorMessage += ' - ' + response.status + ' - ' + response.statusText + ' - ' + response.responseText;
    }
    message.innerHTML = errorMessage;
};
function displaySuccess(successMessage) {
    let message = document.getElementById('Message');
    message.className = 'message messageSuccess';
    message.innerHTML = successMessage;
    setTimeout(function () {
        message.className = '';
        message.innerHTML = '';
    }, 3000);
}
function addElementToTableRow(name, tagName, type, className, required, validValues, value, cellIndex, tableRow) {
    let element = document.createElement(tagName);
    element.type = type;
    element.name = name;
    if (className !== undefined) {
        element.classList.add(className);
    }
    if (element.type === 'select-one' && validValues !== undefined) {
        loadSelectElement(element, validValues);
    }
    if (value !== undefined) {
        element.value = value;
        element.required = required;
        if (cellIndex === 0) {
            addDeleteButton(tableRow);
        }
    }    
    tableRow.cells[cellIndex].appendChild(element);
    return element;
}
function addDeleteButton(tableRow) {
    let deleteButton = document.createElement('a');
    deleteButton.innerHTML = '&#128465;';
    deleteButton.title = 'Delete';
    deleteButton.classList.add('delete');
    deleteButton.onclick = function () {
        let table = tableRow.parentElement;
        table.removeChild(tableRow);
    }
    tableRow.cells[0].appendChild(deleteButton);
}
function tableRowChanged(tableRow, callBackFunction) {
    let inputs = tableRow.querySelectorAll("input.userInput");
    for (input of inputs) {
        input.required = true;
    }
    if (tableRow.querySelector(".delete") === null) {
        addDeleteButton(tableRow);
        callBackFunction();
     }
}
function loadSelectElement(selectElement, selectListItems) {
    for (item of selectListItems) {
        option = document.createElement("option");
        option.value = item.ID;
        option.text = item.Name;
        selectElement.appendChild(option);
    }
}


