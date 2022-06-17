# spext-assignment

## Tools
1. VS Code
2. GitPod
3. Github
4. MongoDB
5. Docker & Docker Compose
6. Moleculer Framework (Node.js)
7. DigitalOcean for Deploy

## Getting Started Development

### Docker
1. Requirements: docker, docker-compose
2. `docker-compose up -d`
3. Server will be running on localhost:3000

### Non-Docker
1. Duplicate example.env to .env
2. Insall packages using `npm i`
3. Run `npm run dev:local` to start server on localhost:3000

### GitPod Web IDE
1. Create Account in GitPod and create new workspace with this repo.
2. Duplicate example.env to .env
3. Gitpod will automatically start the services up and live url will be available.

## How to use API using Postman
1. There are 2 main entities: User & Media.
2. You need to create a user account and login to manage media.
3. Using Public collection you can create/login to the system, (automatically the auth token will be set to postman environment in use)
4. Media collection has all the endpoints required to manage media, Upload, List, Get Info, Delete, Toggle Public Status. And media operations can be performed using the media name which is unique for an user.
5. Conversions sub collection will help you list available conversions for a given media name and using the Convert api you can initiate the conversion process.
6. Once conversion is complete the media can be fetched using the File collection.
7. If a media is set to public, the Get Info api of media will return a url using which can be publicly accessible.