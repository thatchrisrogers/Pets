function initHomeView() {
    let localOffset = new Date().getTimezoneOffset();
    document.querySelector('#Offset').innerHTML = localOffset;

    let date = new Date();
    document.querySelector('#Date').innerHTML = date;

    document.querySelector('#ISO').innerHTML = date.toISOString();

    //document.querySelector('#Local').innerHTML = date.toLocaleString("sv");
    document.querySelector('#Local').innerHTML = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    document.querySelector('#StartDate').value = date.toISOLocaleString();

    document.querySelector('#TestTime').value = date.toISOLocaleString().split('T')[1];
}
