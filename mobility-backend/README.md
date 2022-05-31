**Mobility-Backend**

***Starting by Docker***
```
docker build -t mobility-backend -f mobility-backend/Dockerfile .

docker run -p 80:80 -v /AUDIO_FILES_DIRECTORY:/usr/app/mobility-backend/audio_files -e DB_HOST="host" -e DB_NAME="db" -e DB_USER="user" -e DB_PASS="pass" -e DB_PORT="5432" -e DB_MAX_CONNECTIONS="10" -e API_PORT="8080" -e API_VARIANT="external" -e API_CORS_ORIGINS="http://localhost,http://mobility-frontend.example" mobility-backend
```


***Starting manually***

Set up your local postgresql database and run db/setup/dbinit.sql
Add an .env file that contains the following variables:
```
DB_HOST=localhost
DB_NAME=mobility-db
DB_USER=postgresuserame
DB_PASS=postgrespass
DB_PORT=5432
DB_MAX_CONNECTIONS=10

API_PORT=8080
API_VARIANT=external
API_CORS_ORIGINS=https://localhost:9001,http://mobility-frontend.example
```
Run
```
npm install dotenv --save
```
Uncomment the dotenv code in the dbconfig/dbconnector.ts file

If you are not running linux based system the package.json might have to be adjusted to read
```
"scripts": {
   "build": "if exist dist rmdir dist /q /s && tsc",
...
```


Default linux configuration should be
```
"scripts": {
    "build": "rm -r dist && tsc",
...
```

Otherwise, start the mobility backend:
```
npm start
```

**External API-Variant**

_POST /person_

```
Request Body

Content-Type: application/json
{
	"age": "30 – 39",
	"gender": "female",
	"maritalStatus": "A1",
	"employmentStatus": "B",
	"householdIncome": "1500 € – 3000 €",
	"additional": "ADDITIONAL_INFO",
	"personsInNeed": [
		{
			"name": "NAME",
			"age": "60 – 69",
			"personInNeedClass": "E",
			"isSameHousehold": false
		}
	]
}
```

```
Response Body

Content-Type: application/json
{
    "personId": 1
}
```

_POST /entry_

```
Request Body

Content-Type: application/json
{
	"personId": 1,
	"description": "DESCRIPTION",
	"weekdays": [0,4,6],
	"mobilityFeatures": [
		{
			"title": "TITLE",
			"startTime": "2021-10-28T13:46:07.457Z",
			"endTime": "2021-10-28T13:55:25.457Z",
			"comment": "COMMENT",
			"cost": 3.50,
			"geometryIndex": 1,
			"mobilityMode": "bus",
			"featureGeometry": {}
		}
	],
	"annotationFeatures": [
		{
			"comment": "COMMENT",
			"geometryIndex": 1,
			"featureGeometry": {}
		}
	]
}
```

```
Response Body

Content-Type: application/json
{
    "entryId": 1
}
```

_POST /audio_

```
Request Body

Content-Type: multipart/form-data
Content-Disposition: form-data; name="audio_1"; filename="1_audio_record_0";
Content-Disposition: form-data; name="audio_2"; filename="1_audio_record_1";
Content-Disposition: form-data; name="entryId"; value="1";
```

```
Response Body

Content-Type: text
200 OK
```

**Internal API-Variant**

_GET /person_

```
Response Body

Content-Type: application/json
[
	{
		"personId:" 1,
		"age": "30 – 39",
		"gender": "female",
		"maritalStatus": "A1",
		"employmentStatus": "B",
		"householdIncome": "1500 € – 3000 €",
		"additional": "ADDITIONAL_INFO",
		"personsInNeed": [
			{
				"name": "NAME",
				"age": "60 – 69",
				"personInNeedClass": "E",
				"isSameHousehold": false
			}
		],
		"mobilityEntries:" [
			"description": "DESCRIPTION",
			"weekdays": [0,4,6],
			"audioFiles": [
				"audio/1_audio_record_0.webm",
				"audio/1_audio_record_1.webm"
			],
			"mobilityFeatures": [
				{
					"title": "TITLE",
					"startTime": "2021-10-28T13:46:07.457Z",
					"endTime": "2021-10-28T13:55:25.457Z",
					"comment": "COMMENT",
					"cost": 3.50,
					"geometryIndex": 1,
					"mobilityMode": "bus",
					"featureGeometry": {}
				}
			],
			"annotationFeatures": [
				{
					"comment": "COMMENT",
					"geometryIndex": 1,
					"featureGeometry": {}
				}
			]
		]
	}
]
```

_GET /person/delete/:PERSON_ID_

```
Response Body

Content-Type: text/plain

200 OK
```

_GET /entry_

```
Response Body

Content-Type: application/json
[
	{
		"entryId": 1,
		"description": "DESCRIPTION",
		"weekdays": [0,4,6],
		"audioFiles": [
				"audio/1_audio_record_0.webm",
				"audio/1_audio_record_1.webm"
		],
		"mobilityFeatures": [
			{
				"title": "TITLE",
				"startTime": "2021-10-28T13:46:07.457Z",
				"endTime": "2021-10-28T13:55:25.457Z",
				"comment": "COMMENT",
				"cost": 3.50,
				"geometryIndex": 1,
				"mobilityMode": "bus",
				"featureGeometry": {}
			}
		],
		"annotationFeatures": [
			{
				"comment": "COMMENT",
				"geometryIndex": 1,
				"featureGeometry": {}
			}
		]
	}
]
```

_GET /entry/delete/:ENTRY_ID_

```
Response Body

Content-Type: text/plain

200 OK
```

_GET /feature/:FEATURE_ID_

```
Response Body

Content-Type: application/json
[
	{
		"featureId: 1,
		"title": "TITLE",
		"startTime": "2021-10-28T13:46:07.457Z",
		"endTime": "2021-10-28T13:55:25.457Z",
		"comment": "COMMENT",
		"cost": 3.50,
		"geometryIndex": 1,
		"mobilityMode": "bus",
		"featureGeometry": {}
	}
]
```

_GET /audio/:AUDIO_FILE_

```
Response Body

Content-Type: audio/webm | audio/ogg | audio/mp4
```

**Both Variants**

_GET /aggregated_

```
Response Body

Content-Type: application/json
{
	"type": "FeatureCollection",
	"features": [
		{
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [
					9.99,
					53.55
				]
			},
		"properties": {}
		}
	}
}
```
