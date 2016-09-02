const express = require('express');
const router = express.Router();
const pg = require('pg');
const DATABASE_URL = 'postgres://fidbvttodbpssc:ygSkoG5ECKgTGVI_iTlB-MD2rQ@ec2-54-243-28-22.compute-1.amazonaws.com:5432/d6vqln1g3antb3'
var clientRet;

pg.defaults.ssl = true;

pg.connect(DATABASE_URL, (err, client) => {
    if (err) throw err;
    console.log('Connected to postgres! Getting tables...');

    router.get('/', (req, res) =>{
  res.render('index', { title: 'Express' });
});

     router.get('/new', (req, res) =>{
        res.render('index', { title: 'Express' });
    });

    router.get('/:index', (req, res) =>{
        client
            .query(`SELECT
                        "Index",
                        "URL"
                    FROM
                        public."urlsToLitleUrl"
                    WHERE
                       "Index" = ${req.params.index};`)
            .on('row', row =>{
                    console.log('dentro do redirect',row.URL);
                    res.redirect(row.URL);
                    }

               );


    });



    router.get('/new/:longUrl',(req, res)=> {
        const fullUrl = req.get('host');
        const longUrl = req.params.longUrl;
        client
            .query(`SELECT
                        "Index",
                        "URL"
                    FROM
                        public."urlsToLitleUrl"
                    WHERE
                       "URL" = '${longUrl}';`)
            .on('row', row =>{

                    console.log('dentro do check',row);
                   res.end(`{ "original_url":"${longUrl}", "short_url":"${fullUrl}/${row.Index}" }`);
                    }

               );


    });

});

module.exports = router;
