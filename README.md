# e-bidding-be

Core business logic and APIs for E bidding module

## Setup

Ensure the following is installed ans setup on your machine.

- Git
- NodeJS

### Clone the repository

Clone this repository to your desired destination

```bash
git clone https://github.com/ARG-Supply-Tech/e-bidding-be.git
```

### Install dependencies

Open the cloned directory and install the dependencies with your preferred package manager.

#### Using npm

```bash
npm install
```

### Environment configuration

Copy `.env.example` to a new file named `.env`.  
Edit the .env file to set up your environment variables (database URL, Redis config, etc.).

### Database setup

The core database is deployed on the cloud but you need a local redis server running to start the development environment.

#### Install Docker

Download and install [Docker](https://www.docker.com/) for your operating system.

#### Install redis image

Pull a redis image from the docker repository

```bash
docker pull redis
```

#### Run the redis container

```bash
docker run --name my-redis -p 6379:6379 -d redis
```

#### Verify the Redis Container is Running

```bash
docker ps
```

#### Stopping the Redis Container

```bash
docker stop my-redis
```

and to start it again, use:

```bash
docker start my-redis
```

> Note: Ensure that the redis container is running before starting the development server, otherwise the server will crash.

### Run the Development Server

Start the development server.

For Linux and Unix based systems:

```bash
npm run dev
```

For windows:

```cmd
npm run dev-win
```

The application should be available at <http://localhost:3000>.
