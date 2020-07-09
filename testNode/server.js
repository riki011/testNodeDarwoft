let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let sqlite3 = require('sqlite3').verbose();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


let db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(' conected to database ');
  });

db.serialize(function() {
    //formato de birthDay date para insert = mm-dd  ejemplo '04-25'
  db.run("CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name varchar(50), lastName varchar(50), birthDay date, dni int)");
 
});


app.post('/createUser', (req,res) => {

    if(!req.body){
        return res.status(500).send('error');
    }
    //asumiendo que TODOS los campos sean obligatorios
    if(!req.body.name || !req.body.lastName || !req.body.birthDay || !req.body.dni){
        return res.status(500).send('error');
    }

    let name = req.body.name;
    let lastName = req.body.lastName;
    let birthDay = req.body.birthDay;
    let dni = req.body.dni;

    db.run("INSERT INTO user (name,lastName,birthDay,dni) VALUES ('"+name+"','"+lastName+"','"+birthDay+"',"+dni+")",
        (err,response) => {
            if(err){
                return res.status(404).send('error en la consulta');
            }
            else {
                res.sendStatus(200);
            }
        }); 
});

app.put('/updateUser/:id', (req,res) => {
    if(!req.params.id){
      return res.status(500).send('error');
    }
    if(!req.body){
        return res.status(500).send('error');
    }

    if(req.body.name){
        if(!(typeof(req.body.name)==='string')){
            return res.status(500).send('error');
        }
        var name = req.body.name;
    }
    if(req.body.lastName){
        if(!(typeof(req.body.lastName)==='string')){
            return res.status(500).send('error');
        }
        var lastName = req.body.lastName;
    }
    if(req.body.birthDay){
        if(!(typeof(req.body.birthDay)==='string')){
            return res.status(500).send('error');
        }
        var birthDay = req.body.birthDay;
    }
    if(req.body.dni){
        if((typeof(req.body.dni)==='string')){
            return res.status(500).send('error solo numeros');
        }
        var dni = req.body.dni;
    } 
    let id = req.params.id;

    db.get('select * from user where id ='+id, (err,response) => {
        if(err){
            return res.status(404).send("user not found");
        }
        if(!response){
            return res.status(404).send("user not found");
        }
        if(response){
            if(name){
                db.run('update user set name ="'+name+'" where id='+id); 
            }
            if(lastName){
                db.run('update user set lastName ="'+lastName+'" where id='+id);
            }
            if(birthDay){
                db.run('update user set birthDay ="'+birthDay+'" where id='+id);
            }
            if(dni){
                db.run('update user set dni ='+dni+' where id='+id);
            }    
        } 
        res.sendStatus(200);
    });
});

app.delete('/deleteUser/:id', (req,res) => {
    if(!req.params.id){
        return res.status(500).send('error');
    }
    let id = req.params.id;

    db.get('select * from user where id ='+id, (err,response) => {
        if(err){
            return res.status(404).send("user not found");
        }
        if(!response){
            return res.status(404).send("user not found");
        }
        if(response){
            db.run('delete from user where id='+id);

        }  
           res.sendStatus(200);
    });
});

app.post('/filtradoCumpleAntesyCadena' , (req,res) => {
//formato fecha  mm-dd  ejemplo '04-25'
//filtro combinado por fecha o cadena o los 2..
if(!req.body){
    res.sendStatus(500);
}
if(req.body.fecha){
    if(!(typeof(req.body.fecha)==='string')){
        return res.sendStatus(500);
    }
    var fecha= req.body.fecha;
} 
if(req.body.cadena){
    if(!(typeof(req.body.cadena)==='string')){
        return res.sendStatus(500);
    }
    var cadenaTexto= req.body.cadena;
}

if(fecha && cadenaTexto!==undefined){
 db.all('select * from user where birthDay < "'+fecha+'" or (name like "%'+cadenaTexto+'%" or lastName like "%'+cadenaTexto+'%")', (err,resp)=>{
    if(err){
        res.sendStatus(404);
    }
   if(resp){
       res.json(resp);
    }
 });
}
if(fecha && cadenaTexto===undefined){
    db.all('select * from user where birthDay < "'+fecha+'"', (err,resp)=>{
        if(err){
            res.sendStatus(404);
        }
       if(resp){
           res.json(resp);
        }
     });
}
if(fecha===undefined && cadenaTexto){
    db.all('select * from user where name like "%'+cadenaTexto+'%" or lastName like "%'+cadenaTexto+'%"', (err,resp)=>{
       if(err){
           res.sendStatus(404);
       }
      if(resp){
          res.json(resp);
       }
    });
   }
});

app.get('/listar',  (req,res) => {

    db.all("SELECT * from user", function(err, respuesta) {
    if(err){
        return res.status(404).send('error en la consulta');
    }
    res.json(respuesta);
    }); 
});
    

app.listen(8080, function(){

    console.log('escuchando puerto 8080');
});

