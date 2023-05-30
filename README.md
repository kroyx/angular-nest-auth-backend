# Backend en Nest

```
docker compose up -d
```

Copiar el archivo ```.env.template``` y renombrarlo a ```.env```

Instalar las dependencias para conectar Nest con MongoDB
(https://docs.nestjs.com/techniques/mongodb)

```
npm i @nestjs/mongoose mongoose
```

Añadir en el archivo ```app.module.ts``` el import necesario para la conexión con la base de datos
```
@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
```