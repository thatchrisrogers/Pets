let person;
let businessListItems = [];
var customerListItems = [];
var careProviderListItems = [];
var petTypeListItems = [];

function initLoginView() {
    document.getElementById('LoginForm').onsubmit = function (event) {
        event.preventDefault();
        getUser(initValidValues, displaySecurePages);
    };
}
function getUser(callBackFunction1, callBackFunction2) {
    let loginForm = document.getElementById('LoginForm');
    person = {};
    person.UserName = loginForm.UserName.value;
    person.Password = loginForm.Password.value;

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "api/person", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 204) {
                person = JSON.parse(this.responseText);  
                displaySuccess('Hi ' + person.FirstName + '.  Your Login was Successful');
                callBackFunction1(callBackFunction2);
            }
            else {
                person = undefined;
                displayError('Login Error - User Name or Password was not found.', undefined);
            }
        }
    };
    xhttp.send(JSON.stringify(person));
    xhttp.onerror = function () {
        person = undefined;
        displayError('Login Error - onerror event');
    };
}
function initValidValues(callBackFunction) {
    getValidValues('business', businessListItems);
    getValidValues('customer', customerListItems);
    getValidValues('careProvider', careProviderListItems);
    getValidValues('petType', petTypeListItems);
    callBackFunction();
}
function displaySecurePages() {
    let secureNavLinks = document.querySelectorAll('a.topNavSecure');
    for (secureNavLink of secureNavLinks) {
        secureNavLink.style.display = 'block';
    }
    document.getElementById('LoginLink').style.display = 'none';
    setTimeout(function () {
        loadView('?view=home'); 
    }, 3000);    
}

    