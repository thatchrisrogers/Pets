let localBusinesses = [];
let selectLocalBusiness;
let requestCareForm;

function initVisitorView() {
    initCalendarControls();
    selectLocalBusiness = document.getElementById('SelectLocalBusiness');
    selectLocalBusiness.onclick = function () {
        getBusinessUnavailableDates(selectLocalBusiness.value, createVisitorCalendar);
    }
    getLocalBusinesses(getBusinessUnavailableDates); //ToDo - figure out how to select local 
    
}
function getLocalBusinesses(callBackFuntion) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'api/business', true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status === 200) {
            localBusinesses = JSON.parse(this.responseText);
            loadSelectElement(selectLocalBusiness, localBusinesses, false);
            callBackFuntion(selectLocalBusiness.value, createVisitorCalendar);
        }
    };
    xhttp.send();
    xhttp.onerror = function () {
        displayError('getLocalBusinesses - onerror event');
    };
}
function createVisitorCalendar() {
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
    let iDate;

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
                calendarDay.innerHTML = dayOfMonth;              
               
                if (iDate.valueOf() === todaysDate.valueOf()) {
                    calendarDay.classList.add('currentCalendarDay');
                    let theTime = document.createElement('h6');
                    theTime.id = 'TheTime';
                    calendarDay.appendChild(theTime);
                }
                else if (iDate < todaysDate) {
                    calendarDay.classList.add('pastCalendarDay');
                }
                else if (businessUnavailableDates.find(item => item.UnavailableDate.valueOf() === iDate.valueOf()) !== undefined) {
                    calendarDay.classList.add('unavailableCalendarDay');
                }

                if (calendarDay.classList.contains('pastCalendarDay') === false && calendarDay.classList.contains('unavailableCalendarDay') === false) {
                    calendarDay.classList.add('availableCalendarDay');
                    calendarDay.onclick = function () {
                        displayRequestCareForm(new Date(selectYear.value, parseInt(selectMonth.value) - 1, this.innerHTML));
                    }
                }             
                calendarRow.appendChild(calendarDay);
                dayOfMonth++;
            }
        }
        calendarBody.appendChild(calendarRow); // appending each row into calendar body.
        setTheTime();
    }
}
function displayRequestCareForm(startDate) {
    requestCareForm = document.forms.namedItem('RequestCareForm');
    requestCareForm.style.display = 'block';
    requestCareForm.StartDate.value = startDate.toLocaleDateString().toDateInputFormat(); 
    requestCareForm.StartDate.min = startDate.toLocaleDateString().toDateInputFormat();
    let iDate = startDate;
    iDate.setHours(0, 0, 0);

    for (let businessUnavailableDate of businessUnavailableDates) {
        if (businessUnavailableDate.UnavailableDate.valueOf() === iDate.valueOf()) {
            requestCareForm.EndDate.max = new Date(iDate.setDate(iDate.getDate() - 1)).toLocaleDateString().toDateInputFormat();
            break;
        }
        iDate.setDate(iDate.getDate() +1);
    }

   // requestCareForm.EndDate.value = new Date(startDate.addDays(1)).toLocaleDateString().toDateInputFormat(); 
}
function closeRequestCareForm() {
    requestCareForm.style.display = 'none';
}