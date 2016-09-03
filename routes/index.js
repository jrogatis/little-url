const express = require('express');
const router = express.Router();
const pg = require('pg');
const validator = require('validator');
const DATABASE_URL = 'postgres://fidbvttodbpssc:ygSkoG5ECKgTGVI_iTlB-MD2rQ@ec2-54-243-28-22.compute-1.amazonaws.com:5432/d6vqln1g3antb3'


pg.defaults.ssl = true;

pg.connect(DATABASE_URL, (err, client) => {
    if (err) throw err;
    //console.log('Connected to postgres! Getting tables...');

    router.get('/', (req, res) => {
        res.render('index', {
            title: 'Express'
        });
    });

    router.get('/new', (req, res) => {
        res.render('index', {
            title: 'Express'
        });
    });

    router.get('/:index', (req, res) => {
        client
            .query(`SELECT
                        "Index",
                        "URL"
                    FROM
                        public."urlsToLitleUrl"
                    WHERE
                       "Index" = ${req.params.index};`)
            .on('row', row => {
                    //console.log('dentro do redirect', row.URL);
                    res.redirect(row.URL);
                }

            );


    });

    router.get('/new/*', (req, res) => {
        //console.log('passeisim',req.params[0]);
        const fullUrl = req.get('host');
        const longUrl = req.params[0];
        let urls = [];
        //console.log(validator.isURL(longUrl, {require_protocol: true}));
        if (!validator.isURL(longUrl, {require_protocol: true})) {
            res.end('its not a valid Url')
        } else {
            //console.log('saco');

            client
                .query(`SELECT
                            "Index",
                            "URL"
                        FROM
                            public."urlsToLitleUrl"
                        WHERE
                           "URL" = '${longUrl}';`
                 )
                .on('row', row => {

                        //console.log('dentro do check', row);

                       urls.push(row);

                })
                .on('end', () => {
                    //console.log(urls.length)
                    if (urls.length > 0) {
                        res.writeHead(200, {
                                'content-type': 'text/plain'
                            });
                        res.end(`{ "original_url":"${longUrl}", "short_url":"${fullUrl}/${urls[0].Index}" }`);
                    } else {
                        urls=[]
                        client
                            .query(`INSERT INTO  public."urlsToLitleUrl" ("URL") VALUES ('${ req.params[0]}');`)
                            .on('end', () => {
                                client
                                    .query(`SELECT
                                                "Index",
                                                "URL"
                                            FROM
                                                public."urlsToLitleUrl"
                                            WHERE
                                               "URL" = '${longUrl}';`
                                      )
                                    .on('row', row => {

                                            //console.log('dentro do check', row);
                                            urls.push(row);

                                            })
                                    .on('end', ()=>{
                                              res.end(`{ "original_url":"${longUrl}", "short_url":"${fullUrl}/${urls[0].Index}" }`);
                                        })
                            })

                    }
                })

        }

    });

});

module.exports = router;
