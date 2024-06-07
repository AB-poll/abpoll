**This app is using Flask 2.0.2, Docker, and Python 3.10.0**. 

![Screenshot](https://imagedelivery.net/hnHx9kxJyligwC1X9CPssg/939d3f91-fa8b-4d78-fac6-4322c74b1b00/public)

## Table of contents

- [Tech stack](#tech-stack)
- [Notable opinions and extensions](#notable-opinions-and-extensions)
- [Running this app](#running-this-app)
- [Files of interest](#files-of-interest)
  - [`.env`](#env)
  - [`run`](#run)
- [Running a script to automate renaming the project](#running-a-script-to-automate-renaming-the-project)
- [Updating dependencies](#updating-dependencies)
- [See a way to improve something?](#see-a-way-to-improve-something)
- [Additional resources](#additional-resources)
  - [Learn more about Docker and Flask](#learn-more-about-docker-and-flask)
  - [Deploy to production](#deploy-to-production)
- [About the author](#about-the-author)

## Tech stack

If we don't like some of these choices that's no problem, we can swap them
out for something else on our own.

### Back-end

- [PostgreSQL](https://www.postgresql.org/)
- [SQLAlchemy](https://github.com/sqlalchemy/sqlalchemy)
- [Redis](https://redis.io/)
- [Celery](https://github.com/celery/celery)

### Front-end

- [Bootstrap5](https://getbootstrap.com/docs/5.0/getting-started/introduction/)
- [Feather Icons](https://feathericons.com/)
- [Material Design Icons](https://materialdesignicons.com/)
- [Iconscout (Unicons) Icons](https://iconscout.com/unicons)

#### But what about JavaScript?!

Picking a JS library is a very app specific decision because it depends on
which library we like, and it also depends on if our app is going to be
mostly Jinja templates with sprinkles of JS or an API back-end.

This isn't an exhaustive list but here's a few reasonable choices depending on
how you're building our app:

- <https://jquery.com/>
- <https://fingerprint.com/>
- <https://pusher.com/>
- <https://momentjs.com/>

On the bright side with esbuild being set up we can use any (or none) of these
solutions very easily. we could follow a specific library's installation
guides to get up and running in no time.

Personally I'm going to be using Hotwire Turbo + Stimulus in newer
projects.

## Notable opinions and extensions

Flask is a very opinionated framework, but I find in most apps I'm adding the
same things over and over. Here's a few (but not all) noteworthy additions
and changes.

- **Packages and extensions**:
    - *[gunicorn](https://gunicorn.org/)* for an app server in both development and production
    - *[Flask-DB](https://github.com/nickjj/flask-db)* to help manage, migrate and seed our database
    - *[Flask-Static-Digest](https://github.com/nickjj/flask-static-digest)* to md5 tag and gzip our static files (and add optional CDN support)
    - *[Flask-Secrets](https://github.com/nickjj/flask-secrets)* to quickly generate secure random tokens we can use for various things
    - *[Flask-DebugToolbar](https://github.com/flask-debugtoolbar/flask-debugtoolbar)* to show useful information for debugging
- **Linting, formatting and testing**:
    - *[flake8](https://github.com/PyCQA/flake8)* is used to lint the code base
    - *[black](https://github.com/psf/black)* is used to format the code base
    - *[pytest](https://github.com/pytest-dev/pytest)* and *pytest-cov* for writing tests and reporting test coverage
- **Blueprints**:
    - Add `page` blueprint to render a `/` page and `/up` health check endpoint
- **Config**:
    - Log to STDOUT so that Docker can consume and deal with log output 
    - Extract a bunch of configuration settings into environment variables
    - `config/settings.py` and the `.env` file handles configuration in all environments
- **Front-end assets**:
    - `assets/` contains all our CSS, JS, images, fonts, etc. and is managed by esbuild
    - Custom `502.html` and `maintenance.html` pages
    - Generate favicons using modern best practices
- **Flask defaults that are changed**:
    - `public/` is the static directory where Flask will serve static files from
    - `static_url_path` is set to `""` to remove the `/static` URL prefix for static files
    - `ProxyFix` middleware is enabled (check `abpoll/app.py`)

Besides the Flask app itself:

- Docker support has been added which would be any files having `*docker*` in
  its name
- GitHub Actions have been set up
- A `requirements-lock.txt` file has been introduced using `pip3`. The
  management of this file is fully automated by the commands found in the `run`
  file. We'll cover this in more detail when we talk about [updating
  dependencies](#updating-dependencies).

## Running this app

You'll need to have [Docker installed](https://docs.docker.com/get-docker/).
It's available on Windows, macOS and most distros of Linux. If you're new to
Docker and want to learn it in detail check out the [additional resources
links](#learn-more-about-docker-and-flask) near the bottom of this
README.

If you're using Windows, it will be expected that you're following along inside
of [WSL or WSL
2](https://nickjanetakis.com/blog/a-linux-dev-environment-on-windows-with-wsl-2-docker-desktop-and-more).
That's because we're going to be running shell commands. we can always modify
these commands for PowerShell if we want.

#### Clone this repo anywhere we want and move into the directory:

```sh
git clone https://github.com/AB-poll/abpoll-flask abpoll
cd abpoll

# Optionally checkout a specific tag, such as: git checkout 0.8.0
```

#### Copy a few example files because the real files are git ignored:

```sh
cp .env.example .env
cp docker-compose.override.yml.example docker-compose.override.yml
```

#### Build everything:

*The first time we run this it's going to take 5-10 minutes depending on your
internet connection speed and computer's hardware specs. That's because it's
going to download a few Docker images and build the Python + Yarn dependencies.*

```sh
docker-compose up --build
```

Now that everything is built and running we can treat it like any other Flask 
app.

Did we receive an error about a port being in use? Chances are it's because
something on our machine is already running on port 8000. Check out the docs
in the `.env` file for the `DOCKER_WEB_PORT_FORWARD` variable to fix this.

#### Setup the initial database:

```sh
# we can run this from a 2nd terminal. It will create both a development and
# test database with the proper user / password credentials.
./run flask db reset --with-testdb
```

*We'll go over that `./run` script in a bit!*

#### Check it out in a browser:

Visit <http://abpoll.com> in your favorite browser.

#### Linting the code base:

```sh
# we should get no output (that means everything is operational).
./run lint
```

#### Formatting the code base:

```sh
# we should see that everything is unchanged (it's all already formatted).
./run format
```

#### Running the test suite:

```sh
# we should see all passing tests. Warnings are typically ok.
./run test
```

#### Stopping everything:

```sh
# Stop the containers and remove a few Docker related resources associated to this project.
docker-compose down
```

You can start things up again with `docker-compose up` and unlike the first
time it should only take seconds.

## Files of interest

I recommend checking out most files and searching the code base for `TODO:`,
but please review the `.env` and `run` files before diving into the rest of the
code and customizing it. Also, we should hold off on changing anything until
we cover how to customize this example app's name with an automated script
(coming up next in the docs).

### `.env`

This file is ignored from version control so it will never be commit. There's a
number of environment variables defined here that control certain options and
behavior of the application. Everything is documented there.

Feel free to add new variables as needed. This is where we should put all of
your secrets as well as configuration that might change depending on your
environment (specific dev boxes, CI, production, etc.).

### `run`

You can run `./run` to get a list of commands and each command has
documentation in the `run` file itself.

It's a shell script that has a number of functions defined to help we interact
with this project. It's basically a `Makefile` except with [less
limitations](https://nickjanetakis.com/blog/replacing-make-with-a-shell-script-for-running-your-projects-tasks).
For example as a shell script it allows us to pass any arguments to another
program.

This comes in handy to run various Docker commands because sometimes these
commands can be a bit long to type. Feel free to add as many convenience
functions as we want. This file's purpose is to make our experience better!

*If we get tired of typing `./run` we can always create a shell alias with
`alias run=./run` in our `~/.bash_aliases` or equivalent file. Then you'll be
able to run `run` instead of `./run`.*

## CLI Commands

In this program we have created a CLI directory to run CLI commands directly 
inside of docker. 

### Creating CLI Commands

In order to create new CLI commands you have to create them in the CLI directory 
and they will be automatically  registered to the blueprint. All you have to do 
is follow the click documentation on how to create them or look at an already 
created CLI Tasks.

## Running CLI Commands

To run CLI tasks or commands you have to go in the root directory and use the `./run` 
script to run the cli commands. You can view CLI command by running `./run flask --help`

### Notable CLI Commands

| commands                                                      | Description                                                          |
|---------------------------------------------------------------|----------------------------------------------------------------------|
| `./run flask stripe list-plans`                               | List all existing plans on Stripe.                                   |
| `./run flask stripe sync-plans`                               | Sync (upsert) STRIPE_PLANS to Stripe.                                |
| `./run flask secrets`                                         | Generate a set of random secret tokens.                              |
| `./run flask db migrate revision --autogenerate -m “explain”` | This will generate a new migration for you when you edit the models. |
| `./run flask db migrate`                                      | This will implement the migrations ran in the above command          |





## Running a script to automate renaming the project

The app is named `abpoll` right now but chances are our app will be a different
name. Since the app is already created we'll need to do a find / replace on a
few variants of the string "abpoll" and update a few Docker related resources.

And by we I mean I created a zero dependency shell script that does all of the
heavy lifting for you. All we have to do is run the script below.

#### Start and setup the project:

This won't take as long as before because Docker can re-use most things. We'll
also need to setup our database since a new one will be created for us by
Docker.

```sh
docker-compose up --build

# Then in a 2nd terminal once it's up and ready.
./run flask db reset --with-testdb
```

#### Sanity check to make sure the tests still pass:

It's always a good idea to make sure things are in a working state before
adding custom changes.

```sh
# we can run this from the same terminal as before.
./run lint
./run format
./run test
```

If everything passes now we can optionally `git add -A && git commit -m
"Initial commit"` and start customizing our app. Alternatively we can wait
until we develop more of our app before committing anything. It's up to you!

## Updating dependencies

Let's say you've customized our app and it's time to make a change to your
`requirements.txt` or `package.json` file.

Without Docker you'd normally run `pip3 install -r requirements.txt` or `yarn
install`. With Docker it's basically the same thing and since these commands
are in our `Dockerfile` we can get away with doing a `docker-compose build` but
don't run that just yet.

#### In development:

You can run `./run pip3:outdated` or `./run yarn:outdated` to get a list of
outdated dependencies based on what we currently have installed. Once you've
figured out what we want to update, go make those updates in your
`requirements.txt` and / or `assets/package.json` file.

Then to update our dependencies we can run `./run pip3:install` or `./run
yarn:install`. That'll make sure any lock files get copied from Docker's image
(thanks to volumes) into our code repo and now we can commit those files to
version control like usual.

You can check out the
[run](https://github.com/nickjj/docker-flask-example/blob/main/run) file to see
what these commands do in more detail.

As for the requirements' lock file, this ensures that the same exact versions
of every package we have (including dependencies of dependencies) get used the
next time we build the project. This file is the output of running `pip3
freeze`. we can check how it works by looking at
[bin/pip3-install](https://github.com/nickjj/docker-flask-example/blob/main/bin/pip3-install).

You should never modify the lock files by hand. Add our top level Python
dependencies to `requirements.txt` and our top level JavaScript dependencies
to `assets/package.json`, then run the `./run` command(s) mentioned earlier.

#### In CI:

You'll want to run `docker-compose build` since it will use any existing lock
files if they exist. we can also check out the complete CI test pipeline in
the [run](https://github.com/nickjj/docker-flask-example/blob/main/run) file
under the `ci:test` function.

#### In production:

This is usually a non-issue since you'll be pulling down pre-built images from
a Docker registry but if we decide to build our Docker images directly on
your server we could run `docker-compose build` as part of our deploy
pipeline.

## See a way to improve something?

If we see anything that could be improved please open an issue or start a PR.
Any help is much appreciated!

## Additional resources

Now that we have our app ready to go, it's time to build something cool! If
you want to learn more about Docker, Flask and deploying a Flask app here's a
couple of free and paid resources. There's Google too!

### Learn more about Docker and Flask

#### Official documentation 

- <https://docs.docker.com/>
- <https://flask.palletsprojects.com/>

### Deploy to production

This step is already done, hosted on AWS on an EC2 instance.

## About the author

- Dorcy Shema | <https://dorcis.com> | [@dorcyshema](https://twitter.com/dorcyshema)

I'm a self taught developer and have been freelancing for the last 5 years.
You can read about everything I've learned along the way on my site at
[https://dorcis.com](https://dorcis.com/).

There are numerous [blog posts](https://dorcis.com/articles/) and a couple
of apps we could use on my [portfolio](https://dorcis.com/portfolio/).
