function initBusinessCalendarView() {
    selectBusiness = document.getElementById('SelectBusiness');
    loadSelectElement(selectBusiness, businessListItems, false);
    getBusinessUnavailableDates(selectBusiness.value);
    initCalendarControls();
    loadBusinessCalendar();
}
function loadBusinessCalendar() {
    getCareRequests(createBusinessCalendar);
}
function createBusinessCalendar() {
    let selectedMonth = parseInt(selectMonth.value - 1);
    let selectedYear = parseInt(selectYear.value);
    let firstDayOfMonth = (new Date(selectedYear, selectedMonth)).getDay();
    let calendarBody = document.getElementById('CalendarBody');
    calendarBody.innerHTML = '';   // clearing all previous cells
    // creating all cells
    let dayOfMonth = 1;
    let daysInMonth = 32 - new Date(selectedYear, selectedMonth, 32).getDate();
    let calendarDay;
    let calendarRow;
    let requestStartDate;
    let requestEndDate;
    let iDate;
    let pCustomerName, hiddenCareRequestId;
    let calendarDayHeaderContainer;
    let calendarDayHeader;
    let dateIsUnavailable;
    
    for (let rowNum = 0; rowNum < 6; rowNum++) {
        calendarRow = document.createElement('tr');
        for (let cellNum = 0; cellNum < 7; cellNum++) {
            calendarDay = document.createElement('td');
            calendarDay.classList.add('calendarDay');

            if (rowNum === 0 && cellNum < firstDayOfMonth) {
                calendarRow.appendChild(calendarDay);
            }
            else if (dayOfMonth <= daysInMonth) {
                iDate = new Date(selectedYear, selectedMonth, dayOfMonth);
               
                calendarDayHeaderContainer = document.createElement('div');
                calendarDayHeaderContainer.classList.add('calendarDayHeaderContainer');
                calendarDayHeader = document.createElement('div');
                calendarDayHeader.innerHTML = dayOfMonth;

                dateIsUnavailable = document.createElement('input');
                dateIsUnavailable.type = 'checkbox';
                dateIsUnavailable.title = 'Toggle availability for this date.';
                if (businessUnavailableDates.find(item => item.UnavailableDate.valueOf() === iDate.valueOf()) !== undefined) {
                    dateIsUnavailable.checked = true;
                }
                dateIsUnavailable.onchange = function () { toggleAvailability(this); }

                if (iDate.valueOf() === todaysDate.valueOf()) {
                    calendarDay.classList.add('currentCalendarDay');
                }
                else if (iDate < todaysDate) {
                    calendarDay.classList.add('pastCalendarDay');
                    calendarDayHeader.classList.add('pastCalendarDay');
                }
                else if (businessUnavailableDates.find(item => item.UnavailableDate.valueOf() === iDate.valueOf()) !== undefined) {
                    calendarDay.classList.add('unavailableCalendarDay');
                }

                if (calendarDay.classList.contains('pastCalendarDay') === false && calendarDay.classList.contains('unavailableCalendarDay') === false) {
                    calendarDayHeader.onclick = function () {
                        try {
                            let startDate = new Date(selectYear.value, parseInt(selectMonth.value) - 1, this.innerHTML);
                            appendCareRequestForm(function () { displayCareRequestForm(undefined, startDate); })
                        }
                        catch (e) {
                            displayError('Error displaying Care Request Form - ' + e.message);
                        }
                    }
                }
                
                calendarDayHeaderContainer.appendChild(dateIsUnavailable);
                calendarDayHeaderContainer.appendChild(calendarDayHeader);
                calendarDay.appendChild(calendarDayHeaderContainer);
                
                for (careRequest of careRequests) {
                    requestStartDate = new Date(careRequest.StartDate);
                    requestEndDate = new Date(careRequest.EndDate);
                    if (iDate >= requestStartDate && iDate <= requestEndDate) {
                        pCustomerName = document.createElement('p');
                        pCustomerName.classList.add('calendarEntry');
                        pCustomerName.innerHTML = careRequest.Customer.Name;
                        hiddenCareRequestId = document.createElement('input');
                        hiddenCareRequestId.type = 'hidden';
                        hiddenCareRequestId.name = 'CareRequestId';
                        hiddenCareRequestId.value = careRequest.ID;
                        pCustomerName.appendChild(hiddenCareRequestId);
                        pCustomerName.onclick = function () {
                            let careRequestID = this.querySelector('input[name="CareRequestId"]').value;
                            appendCareRequestForm(function () { displayCareRequestForm(careRequestID, undefined) });
                        }
                        calendarDay.appendChild(pCustomerName);
                    }
                }                
                calendarRow.appendChild(calendarDay);
                dayOfMonth++;
            }
        }
        calendarBody.appendChild(calendarRow); // appending each row into calendar body.
    }
}
function appendCareRequestForm(callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'Views/careRequest.html', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.querySelector('#FormContainer').innerHTML = this.responseText;
            callBackFunction();
        }
    }
    xhttp.send();  
}
function getBusinessUnavailableDates(businessID, callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/businessUnavailableDate?businessID=' + businessID, true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                businessUnavailableDates = JSON.parse(this.responseText);
                for (businessUnavailableDate of businessUnavailableDates) { //Convert to Date object
                    businessUnavailableDate.UnavailableDate = new Date(businessUnavailableDate.UnavailableDate);
                }
                if (typeof (callBackFunction) === typeof (Function)) {
                    callBackFunction();
                }
            }
            else {
                displayError('Error getting Care Requests', this);
            }
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('Error getting Care Requests - onerror event');
    };
}
function toggleAvailability(element) {
    let unavailableDate = {};
    unavailableDate.BusinessID = selectBusiness.value;
    unavailableDate.UnavailableDate = new Date(selectYear.value, parseInt(selectMonth.value) - 1, element.nextSibling.innerHTML);
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "api/businessUnavailableDate/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 204) {
                element.parentElement.classList.toggle('unavailableCalendarDay');
                element.parentElement.parentElement.classList.toggle('unavailableCalendarDay');
                getBusinessUnavailableDates(selectBusiness.value);
            }
            else {
                displayError('Error saving Care Visit', this);
            }
        }
    };
    xhttp.send(JSON.stringify(unavailableDate));
    xhttp.onerror = function () {
        displayError('Error saving Unavailable Date - onerror event');
    };
}






