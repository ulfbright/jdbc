# JDBC API

Jarhead (JDBC API) consists of an individual POST route for each type of database connection (Oracle, Teradata, etc.), listed below. A query to the API returns a multidimensional array of objects as a response. 

***This implementation relies on a global installation of the oracledb NPM module: https://github.com/oracle/node-oracledb***

## Oracle

Available at /oracle/

**Note** that "host" must include port number (example: pbccddb:1562)

```js
{
    config: {
        host: "<the database host name or address AND :port_number>",
        db: "<the specific database to be queried>",
        user: "<a user that has appropriate privilages on the database>",
        pass: "<the corresponding password for the above user>"
    },
    queries: [
        "<query1>",
        "<query2>",
        "<etc.>"
    ]
}
```

**Note** that the queries must be structured as an array. If only a single query is required, it must still be an element within an array.

## Teradata

Available at /teradata/

```js
{
    config: {
        db: "<the specific database to be queried>",
        user: "<a user that has appropriate privilages on the database>",
        pass: "<the corresponding password for the above user>"
    },
    queries: [
        "<query1>",
        "<query2>",
        "<etc.>"
    ]
}
```

**Note** that the Teradata request does not require a "host" property under "config".