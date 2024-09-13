# flottform

A better UX for file uploads #build-in-public

## License

Why no license (yet)? We want to share our progress, but we are not sure about the business model. We allow you to see our theories and learn from how we build it, but it's not allowed to use the produced code (yet). Please wait for the next updates for more information about how we want to handle this. If you have questions or feedback, feel free to reach out to us through [our GitHub discussions board](https://github.com/compose-us/build-in-public/discussions/categories/general-feedback).

## Prototype solution

We are about to explore ideas how we can solve the issue we described in detail about [UX challenges in web forms if you have a file on another device](https://github.com/compose-us/build-in-public/tree/main/updates/2023-10-23%20Defining%20our%20mission%20-%20Improve%20Web%20Form%20File%20Uploads).

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
