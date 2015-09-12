function loadFileToString(path) {

    var client = new XMLHttpRequest();

    client.open('GET', path, false);
    client.send();

    if(client.status == 200) {
        return client.responseText;
    }
    else {
        return null;
    }
}
