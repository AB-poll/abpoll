# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a
Changelog](https://keepachangelog.com/en/1.0.0/).

## [5.0.0] - 2022-09-25
- Added subscriptions
- Added scheduled celery tasks
- Added analytics feature perks to the paying users
- Fixed following follower bugs
- Integrated the privacy and help center more into the app
- Added './run' which didn't work in earlier versions
- Added coupons

## [4.0.3] - 2022-06-5
- Added predictions
- Added sharing votes
- Changed the recommendation algorithm
- Fixed email verification errors, and bugs
- Removed auto scroll
- Fixed login, and register bugs

## [4.0.2] - 2022-05-15
- Added some items to `public/service-worker.js` precache assets from gtmetrix
- Cleaned username lists
- Added a share button to `user-page` and `abpoll.css`
- Added search to medium screens on explore
- Cleaned up chat
- Added better chat look and feel
- Moved signup pop up to sidebar
- Moved sidebar to a different macro


## [4.0.1] - 2022-04-23
- Added play next to post page
- Added some columns to profile
- Fixed notification styling

## [4.0.0] - 2022-04-22
### Changed

- Added fingerprint.js to `public/js/plugins.init.js` 
- Made it required to accept the fingerprint.js to use app
- Added is user registered to header to catch expression
- Rename `webpack` Docker build stage to `assets`
- Moved `a_votes` and `b_votes` table to `did_user_vote`
- Fixed pwa errors and made custom images for `public/manifest.json` work with 
- Moved over data from previous database to new database
- Deleted some trivia

## [0.8.0] - 2021-12-25
### Changed

- Update `assets/tailwind.config.js` based on the new TailwindCSS v3 defaults
- Replace all traces of Webpack with esbuild
- Move JS and CSS from `assets/app` to `assets/js` and `assets/css`
- Rename `webpack` Docker build stage to `assets`
- Copy all files into the `assets` build stage to simplify things
- Replace `cp -a` with `cp -r` in Docker entrypoint to make it easier to delete older assets
- Rename `run hadolint` to `run lint:dockerfile`
- Rename `run flake8` to `run lint`
- Rename `run black` to `run format`
- Rename `run pytest` to `run test`
- Rename `run pytest-cov` to `run test:coverage`
- Rename `run bash` to `run shell`


### Added

- Lint Dockerfile with <https://github.com/hadolint/hadolint>
- `/node_modules/.bin` to `$PATH` to easier access Yarn installed binaries
- `yarn:build:js` and `yarn:build:css` run script commands

### Changed

- Update `assets/tailwind.config.js` based on the new TailwindCSS v3 defaults
- Replace all traces of Webpack with esbuild
- Move JS and CSS from `assets/app` to `assets/js` and `assets/css`
- Rename `webpack` Docker build stage to `assets`
- Copy all files into the `assets` build stage to simplify things
- Replace `cp -a` with `cp -r` in Docker entrypoint to make it easier to delete older assets
- Rename `run hadolint` to `run lint:dockerfile`
- Rename `run flake8` to `run lint`
- Rename `run black` to `run format`
- Rename `run pytest` to `run test`
- Rename `run pytest-cov` to `run test:coverage`
- Rename `run bash` to `run shell`

#### Languages and services

- Update `Node` to `16.13.1`
- Update `PostgreSQL` to `14.1` and switch to Debian Bullseye Slim
- Update `Redis` to switch to Debian Bullseye Slim

#### Back-end packages

- Update `SQLAlchemy-Utils` to `0.38.1`
- Update `SQLAlchemy` to `1.4.29`
- Update `alembic` to `1.7.5`
- Update `celery` to `5.2.1`
- Update `flake8` to `4.0.1`
- Update `psycopg2` to `2.9.2`
- Update `py` to `1.11.0`
- Update `redis` to `4.0.2`
- Update `werkzeug` to `2.0.2`

#### Front-end dependencies

- Update `autoprefixer` to `10.4.0`
- Update `postcss` to `8.4.5`
- Update `tailwindcss` to `3.0.7`

### Removed

- Deleting old assets in the Docker entrypoint (it's best to handle this out of band in a cron job, etc.)

## [0.7.0] - 2021-10-10

### Changed

- Use f string for `db` variable in `config/settings.py`

#### Languages and services

- Update `Python` to `3.10.0` and switch to Debian Bullseye Slim
- Update `PostgreSQL` to `14.0`
- Update `Redis` to `6.2.6`

#### Back-end packages

- Update `Flask-DB` to `0.3.2`
- Update `Flask` to `2.0.2`
- Update `SQLAlchemy-Utils` to `0.37.8`
- Update `SQLAlchemy` to `1.4.25`
- Update `alembic` to `1.7.4`
- Update `celery` to `5.1.2`
- Update `psycopg2` to `2.9.1`
- Update `pytest-cov` to `3.0.0`
- Update `pytest` to `6.2.5`

#### Front-end packages

- Update `@babel/core` to `7.15.8`
- Update `@babel/preset-env` to `7.15.8`
- Update `@babel/register` to `7.15.3`
- Update `autoprefixer` to `10.3.7`
- Update `copy-webpack-plugin` to `9.0.1`
- Update `css-loader` to `6.4.0`
- Update `css-minimizer-webpack-plugin` to `3.1.1`
- Update `mini-css-extract-plugin` to `2.4.2`
- Update `postcss-loader` to `6.1.1`
- Update `postcss` to `8.3.9`
- Update `tailwindcss` to `2.2.16`
- Update `webpack-cli` to `4.9.0`
- Update `webpack` to `5.58.1`

## [0.6.0] - 2021-05-27

### Added

- `abpoll/initializers.py` now exists to define frequently used imports, variables, etc.

### Changed

- Use the Docker Compose spec in `docker-compose.yml` (removes `version:` property)
- Update Tailwind from `2.1.0` to `2.1.2`
- Update all Webpack related dependencies to their latest versions
- Update Flask from `1.1.2` to `2.0.1`
- Update Celery from `5.0.5` to `5.1.0`
- Update Alembic from `1.5.8` to `1.6.4`
- Update SQLAlchemy from `1.4.11` to `1.4.15`
- Update SQLAlchemy-Utils from `0.37.0` to `0.37.4`
- Update Redis from `6.0.10` to `6.2.3`
- Update pytest from `6.2.2` to `6.2.4`
- Update pytest-cov from `2.11.1` to `2.12.0`
- Use the new Flask 2.0 `.get` decorator

## [0.5.0] - 2021-04-24

### Added

- `bin/rename-project` script to assist with renaming the project
- Use Black to format Python code

### Changed

- Switch `OptimizeCSSAssetsPlugin` with `CssMinimizerPlugin` for Webpack 5
- Replace deprecated Webpack 5 `file-loader` with `asset/resource`
- Avoid using multi-line imports with commas or parenthesis
- Update SQLAlchemy from `1.3.23` to `1.4.11`
- Update SQLAlchemy-Utils from `0.36.8` to `0.37.0`
- Update Flask-SQLAlchemy from `2.4.4` to `2.5.1`
- Update gunicorn from `20.0.4` to `20.1.0`
- Update Alembic from `1.5.4` to `1.5.8`
- Update flake8 from `3.8.4` to `3.9.1`
- Update TailwindCSS to `2.1.0` and enable the JIT compiler
- Replace `APP_NAME` in `run` script with `POSTGRES_USER` for connecting to psql

### Removed

- `abpoll/blueprints/` namespace has been removed
- Unused `webpack` import in Webpack config
- Remove Webpack's cache since the JIT compiler is pretty speedy as is

### Fixed

- Code styling issues in the Webpack config (single quotes, semi-colons, etc.)
- Set an empty ENTRYPOINT for the worker to avoid race conditions when copying static files
- Fix `run` script error for unbound variable in older versions of Bash on macOS

## [0.4.0] - 2021-03-02

### Added

- `PORT` env variable to be compatible with more hosting providers
- `CELERY_LOG_LEVEL` env variable to configure Celery's log level (defaults to `info`)
- `run cmd` to run any command you want in the web container, ie. `run cmd python3 --version`

### Changed

- Rename `DOCKER_WEB_PORT` to `DOCKER_WEB_PORT_FORWARD`
- Refactor `run` script so all web container commands use the new `cmd` function
- Replace `##` comments with `#` in the `run` script

### Removed

- Ability to customize gunicorn bind host, it's hard coded to `0.0.0.0` now
- `curl` and `libpq-dev` apt dependencies from the webpack image (they're not needed)
- Remove unnecessary `mkdir` for the pip cache dir and chown'ing `/home/python`

### Fixed

- Define `PYTHONPATH="."` env var in the Dockerfile so that `flask db migrate` works
- Update Flask-DB to `0.3.1` which makes sure `alembic.ini.new` gets properly initalized
- Commit `public/.keep` and make sure the `.keep` file is never removed

## [0.3.0] - 2021-02-20

### Added

- `run pip3:outdated` task to show outdated Python dependencies
- `run yarn:outdated` task to show outdated Node dependencies

### Changed

- Update PostgreSQL from `13.1` to `13.2`
- Update Redis from `6.0.9` to `6.0.10`
- Update Python from `3.9.1` to `3.9.2`
- Update Node from `14.15.1` to `14.5.5`
- Update all Python and Node packages to their latest stable releases
- Import `Redis` more efficiently in `abpoll/extensions.py`
- Disable Flask tip about `python-dotenv` when running any `flask` CLI command
- Refactor `run` script to remove a lot of duplication by introducing helper functions

### Removed

- `terser-webpack-plugin` from `package.json` since it comes with Webpack 5 by default

## [0.2.0] - 2020-12-27

### Changed

- Use `REDIS_URL` to configure connections for Redis directly and Celery
- Add Redis `PING` check to the `/up` health check endpoint

### Removed

- Unnecessary `CELERY_TASK_LIST` comment in `abpoll/app.py`, this was a left over copy / paste mishap

## [0.1.0] - 2020-12-24

### Added

- Everything!

[5.0.0]: https://github.com/AB-poll/abpoll-flask/commit/a2f2049bdf18eefc9cd7d974e8b3e1364a8382bb
[4.0.3]: https://github.com/AB-poll/abpoll-flask/commit/4efcfb1a25b4e5fc5ff28790aae950b04f7fc7d4
[4.0.1]: https://github.com/Dorcy64/abpoll-flask/commit/bd33b677d3050f185762aa786dd9b4c4e12a0477
[4.0.0]: https://github.com/Dorcy64/abpoll-flask/commit/607c14b3ec7546c214fad8321d071f469adccd85
[0.8.0]: https://github.com/nickjj/docker-flask-example/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/nickjj/docker-flask-example/compare/0.6.0...0.7.0
[0.6.0]: https://github.com/nickjj/docker-flask-example/compare/0.5.0...0.6.0
[0.5.0]: https://github.com/nickjj/docker-flask-example/compare/0.4.0...0.5.0
[0.4.0]: https://github.com/nickjj/docker-flask-example/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/nickjj/docker-flask-example/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/nickjj/docker-flask-example/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/nickjj/docker-flask-example/releases/tag/0.1.0
