# Image Classification with Code Engine and Visual Recognition

:warning: WORK IN PROGRESS


## Test the app locally

1. Move to backend, create `.env` file from the `.env.template` and set the environment variables with COS credentials
   ```
   cd backend
   cp .env.template .env
   npm install
   ```
2. Run the backend app and access the app at `http://localhost:3001/`
   ```
   node server.js
   ```
3. Move to frontend and create `.env` file from the `.env.template`
   ```
   cd frontend
   cp .env.template .env
   npm install
   ```
4. Run the below command and browse at `http://localhost:3000/`

## Build the container images

1. On your terminal, move to `frontend` folder and run the command
   ```
   cd frontend
   docker build . -t ibmcom/frontend
   docker push ibmcom/frontend
   ```
2. Move to `backend` folder and run the below command
   ```
   cd backend
   docker build . -t ibmcom/backend
   docker push ibmcom/backend
   ```
