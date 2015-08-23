##Installation

Install as a local package.

```cmd
npm install {name}
```


###Config.json

Setup config.json at the root of the package.

```js
{
    "protocol": "http",
    "host": "localhost",
    "port": "8080",
    "SSLPrivateKey": "",
    "SSLCertificate": "",
    "consumerPrivateKeyFile": "rsa.pem",
    "applications": {
        "jira": {
            "protocol": "https",
            "host": "myhost.com",
            "port": "443",
            "oauth": {
                "consumer_key": "node-oauth-key1",
                "consumer_secret": "",
                "access_token": "",
                "access_token_secret": ""
            },
            "paths": {
                "request-token": "/plugins/servlet/oauth/request-token",
                "access-token": "/plugins/servlet/oauth/access-token",
                "authorize": "/plugins/servlet/oauth/authorize"
            }
        "bamboo": {
            "protocol": "https",
            "host": "myhost.com",
            "port": "443",
            "oauth": {
                "consumer_key": "node-oauth-key1",
                "consumer_secret": "",
                "access_token": "",
                "access_token_secret": ""
            },
            "paths": {
                "request-token": "/plugins/servlet/oauth/request-token",
                "access-token": "/plugins/servlet/oauth/access-token",
                "authorize": "/plugins/servlet/oauth/authorize"
            }
        }
        },
    }
}
```


###OAuth private and public keys

A private-public key pair is required to establish OAuth authorisation with an Atlassian product. The private key and public key can be generated using openssl:

```cmd
$ openssl genrsa -out rsa-key.pem 1024
$ openssl rsa -in rsa-key.pem -pubout -out rsa-key.pub
```


###Setup application link

An [application link](http://confluence.atlassian.com/display/JIRA/Configuring+Application+Links) profile must be established on the Atlassian product using a public key.  The Application Link requests the URL of the application to link. This URL is not used and a fill value should be used like `http://rest`.

In the create link screen (you can enter an application name of your choice):
* Application name: `Node OAuth`
* Application type: `Generic Application`
* Create incoming link: check

In the incoming link screen (you can enter an application name of your choice):
* Consumer Key: `node-oauth-key1`
* Consumer Name: `Node OAuth`
* Public Key: copy public key contents excluding the header `-----BEGIN PUBLIC KEY-----` and footer `-----END PUBLIC KEY-----`.


###SSL Private key and certificate

To run the local website using the https protocol you will need an SSL private key and certificate.  The private key can be generated using openssl:

```cmd
$ openssl genrsa -out rsa-key.pem 1024
```

To obtain a certificate a certificate signing request must be generated:

```cmd
$ openssl req -new -key rsa-key.pem -out certreq.csr
$ openssl x509 -req -in certreq.csr -signkey rsa-key.pem -out rsa-cert.pem
```

The certificate signing request should be sent to a certificate authority for to perform the certificate signing process.  However, for internal development purposes a self signed certificate can be generated:

```cmd
$ openssl x509 -req -in certreq.csr -signkey rsa-key.pem -out rsa-cert.pem
```


##Usage 

###Authorisation dance

Start the local website.

```cmd
npm start
```

Open the website at path /jira for JIRA authorisation or /bamboo for Bamboo authorisation:
* If your config is set to host at `https://localhost` then JIRA authorisation - [https://localhost/jira](https://localhost/jira)
* If your config is set to host at `https://localhost` then Bamboo authorisation - [https://localhost/bamboo](https://localhost/bamboo)

If you have configured the https protocol and used a self signed certificate you will need to navigate security warnings.

If the Atlassian application configuration is valid and you have setup the application link correctly you should see the authorisation page.  Click the Allow button to retrieve and save the OAuth access tokens.  You can now use the REST API for the Atlassian product.


###Using the REST API

You can test the REST API using the local website and path `/rest?req=`.

For example:
* If your config is set to host at `https://localhost` then get all projects from JIRA - [https://localhost/jira/rest?req=project](https://localhost/jira/rest?req=project)
* If your config is set to host at `https://localhost` then get all plans from Bamboo - [https://localhost/bamboo/rest?req=plan](https://localhost/bamboo/rest?req=plan)
