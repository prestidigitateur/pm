# pm

## about
> Safely store your passwords and have access to them everywhere.

[online](https://prestidigitateur.github.io/pm/src/index.html#)

The application allows you to store your passwords and access them offline from any device where there is a browser. Safety is ensured by AES encryption with _CryptoJS_. Adaptability of the interface is provided by _Bootstrap3_.
## for what
The desire to store and access the passwords offline and be sure in their security.
## how to use
### use online version
Just [use](https://prestidigitateur.github.io/pm/src/index.html#)
### use your own online version
Publish this site in any convenient way. If you want to use GoogleDrive change _CLIENT_ID_, _DEVELOPER_KEY_, _APP_ID_ in _googleDrive.js_ according to this [instruction](https://developers.google.com/drive/v3/web/quickstart/js)
**!** You should enable _Google Picker API_ and _Google Drive API_ in [developer console](https://console.developers.google.com).
### use offline version
Just download and drag the folder **scr** in a convenient place. To start, open _index.html_ in the browser. You can create a shortcut for convenience.
Delete _src/js/googleDrive.js_, because it will not work, other functions works as usual.
## !important
The web application can be used on any device with a browser supporting the specification ES2017.
**Internet Explorer is not supported.**
## todo list
- [x] Publish the source code
- [ ] Finish README (RU & EN)
- [x] Publish on GithubPages
- [x] ~~Lead to PWA(progressive web applications) standards~~
- [x] Add GoogleDrive support
- [ ] Something else
## contact 
[Telegram](https://t.me/prestidigitateurVS)
