# flottform

A better UX for file uploads #build-in-public

## License

Please check the [compose.us Non-Commercial License (CUNCL)](./LICENSE.md) document for the complete license.

In simple terms, you're allowed to use Flottform in a non-commercial setting, but if you want to use it in a project, product or service that you sell or receive money for, you have to purchase a proper license from compose.us.

## Prototype solution

We are about to explore ideas how we can solve the issue we described in detail about [UX challenges in web forms if you have a file on another device](https://flottform.io/updates/2023-10-23-defining-our-mission-improve-web-form-file-ploads).

## Update Instructions for Remote Server Deployment

These are the necessary steps to update the code on the remote server to the latest version.

1. Connect to the remote server:

```sh
ssh <email@remote.server>
```

2. Navigate to the Target Repository:

```sh
cd /path/to/your/repository/in/remote/server
```

3. Check the Current Branch Used for Production:

```sh
git status
```

Ensure you are on the correct branch used for production. If not, switch to the appropriate branch:

```sh
git checkout <production-branch>
```

4. Fetch all of the new changes:

```sh
git fetch --all
```

5. [Optional] Update the Environment Variables:

If there are changes required in the environment variables, update the .env file accordingly.

```sh
nano .env
```

6. Stop & re-run the containers:

```sh
docker compose down && git pull && docker compose build && docker compose up -d && docker volume prune —-filter all=1 —-force && docker compose logs -f
```
