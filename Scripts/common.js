﻿var customerListItems = [];
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
            //validValues.push({ ID: '', Name: 'select' });
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
String.prototype.toDateInputFormat = function () {
    let dateParts = this.valueOf().split('/');
    return dateParts[2] + '-' + dateParts[0] + '-' + dateParts[1];
}
Date.prototype.toLocaleDateTime = function () {
    var date = new Date(this.valueOf());
    date.setTime(this.getTime() - (this.getTimezoneOffset() * 60 * 1000));
    return date;
}
Date.prototype.toFormatForDateTimeInput = function () {  //Extend the native Date prototype to return the ISO format for a date that is offset for local timezone
    var dateString = this.getFullYear().toString();
    dateString += '-';
    dateString += (this.getMonth() + 1).toString().padStart(2, '0');
    dateString += '-';
    dateString += this.getDate().toString().padStart(2, '0');
    dateString += 'T';
    dateString += this.getHours().toString().padStart(2, '0');
    dateString += ':';
    dateString += this.getMinutes().toString().padStart(2, '0');
    return dateString;
}

Date.prototype.toWeekday = function () {
    let weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    return weekday[this.getDay()];
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
function addElementToTableRow(name, tagName, type, classNames, required, validValues, value, cellIndex, tableRow) {
    let element = document.createElement(tagName);
    element.type = type;
    element.name = name;
    if (classNames !== undefined) {
        for (className of classNames.split(',')) {
            element.classList.add(className);
        }        
    }
    if (element.type === 'select-one' && validValues !== undefined) {
        loadSelectElement(element, validValues);
    }
    if (value !== undefined) {      
        element.value = value;
        element.required = (required && element.classList.contains('hasDefaultValue') === false) ? true : false;
        if (tableRow.querySelector(".delete") === null && element.classList.contains('hasDefaultValue') === false) {
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
        if (tableRow.classList.contains = 'parentRow') {
            let childTableContainerRow = tableRow.nextElementSibling;
            if (childTableContainerRow.matches('.childTableContainerRow')) {
                table.removeChild(childTableContainerRow);
            }
        }
        table.removeChild(tableRow);
    }
    tableRow.cells[0].appendChild(deleteButton);
}
function tableRowChanged(tableRow, callBackFunction) {
    let inputs = tableRow.querySelectorAll(".userInput");
    for (input of inputs) {
        input.required = true;
        input.classList.remove('hasDefaultValue');
    }
    if (tableRow.querySelector(".delete") === null) {
        addDeleteButton(tableRow);
        callBackFunction();
     }
}
function loadSelectElement(selectElement, selectListItems) {
    let option = document.createElement("option");
    option.value = '';
    option.text = 'select';
    selectElement.appendChild(option);
    for (item of selectListItems) {
        option = document.createElement("option");
        option.value = item.ID;
        option.text = item.Name;
        selectElement.appendChild(option);
    }
}


