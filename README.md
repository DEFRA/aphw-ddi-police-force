# aphw-ddi-police-force

Microservice to lookup police force covering specified coordinates.

## Prerequisites

- Conversion of downloaded ONS Postcodes CSV into a smaller JSON file - see later

- Docker
- Docker Compose

Optional:
- Kubernetes
- Helm

### Installing Node.js dependencies locally

Use the Node.js version in `.nvmrc`, then run `npm ci` (or `npm install`
when updating dependencies).

`boost-geospatial-index` is a native C++ addon. Version 1.5.0 uses Node-API
and includes prebuilt binaries for Linux x64/arm64 with glibc and macOS
x64/arm64. Windows and Alpine Linux (musl) build it from source.
Boost headers are bundled with the package; a separate Boost installation
is not required.

For Windows source builds, install:

- Python 3 (Python 3.12 requires node-gyp 10 or newer).
- Visual Studio 2022 Build Tools with the **Desktop development with C++**
  workload, including the MSVC build tools and Windows SDK.
- For Node.js 26, **C++ Clang Compiler for Windows** and **MSBuild support
  for LLVM (clang-cl) toolset** in the same Visual Studio installation.
  Their component IDs are `Microsoft.VisualStudio.Component.VC.Llvm.Clang`
  and `Microsoft.VisualStudio.Component.VC.Llvm.ClangToolset`.

An `MSB8020` error mentioning `ClangCL` means the Clang toolset is missing;
installing Python or Boost alone will not fix it. After installing the
components, enable C++ exceptions for the Windows build and install:

```powershell
$env:CL = "$env:CL /EHsc".Trim()
npm ci
```

Without `/EHsc`, Clang reports `cannot use 'try' with exceptions disabled`
in the bundled Boost headers. To retain the option for future Windows
sessions, add `/EHsc` to your user `CL` environment variable and restart
VS Code/your terminal. This also affects other C++ builds for that user.
The flag is Windows-specific and must not be set in Linux Docker images.

### Native dependencies in Docker images

The Defra parent images are Alpine-based, so the addon needs `python3`,
`make` and `g++` at build time. These are provided by
`defradigital/node-development`. The runtime needs `libstdc++`, supplied by
the Node.js base image; it does not need Python, a compiler or external
Boost libraries.

Both dependency-install stages set `npm_config_build_from_source=true` for
`npm ci`, ensuring that Alpine gets a locally compiled musl addon rather
than relying on prebuilt-binary detection. The parent image uses npm 12,
which blocks dependency install scripts by default. The `allowScripts`
entry in `package.json` explicitly permits `boost-geospatial-index@1.5.0`
to compile; update this approval when updating the addon version.
Other dependency script approvals are not changed.

Each stage checks that the
compiled `build/Release/BoostSpatialIndex.node` binary loads, including the
development image used by `scripts/test`. A missing or unloadable binary
therefore fails the image build instead of failing later inside Jest.

Production dependencies are installed with `npm ci --omit=dev` in a
`production-dependencies` stage based on the development image, then copied
into the production image. This keeps native compilation out of the
toolchain-free production stage and excludes development dependencies from
the final image. The final image also checks that the addon loads.

Keep the build and runtime stages on matching Node.js, Alpine/libc and CPU
architecture versions. Do not copy Windows host `node_modules` into Linux
images.

## Before running the application
In order for the application to load the necessary files from Blob storage, you will need to do the following:
1. Download Police boundaries from https://data.police.uk/data/boundaries/force_kmls.zip
2. Unzip the file and upload all the KML files to blob storage (to a container called 'police-force-kml')
3. Download Postcodes from https://geoportal.statistics.gov.uk/datasets/3700342d3d184b0d92eae99a78d9c7a3/about (or a later version if it exists)
4. Unzip the file and copy ONSPD_NOV_2023_UK.csv to the root of this codebase
5. Run
   python3 extract-columns-from-csv.py
[If you are using a newer CSV file, you will need to amend the Python script accordingly]
A files called postcodes.json should be created in the root of the project
6. Upload postcodes.json to Blob in a container called 'postcode-areas'


## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

When using the Docker Compose files in development the local `app` folder will
be mounted on top of the `app` folder within the Docker container, hiding the CSS files that were generated during the Docker build.  For the site to render correctly locally `npm run build` must be run on the host system.


By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker-compose build
```

### Start

Use Docker Compose to run service locally.

```
docker-compose up
```

## Test structure

Narrow route integration tests use the real Hapi server and router but mock
the spatial and postcode startup loaders, so they do not require seeded Blob
storage. Local geospatial integration tests use Azurite and real native
geometry with their own KML fixtures.

The tests have been structured into subfolders of `./test` as per the
[Microservice test approach and repository structure](https://eaflood.atlassian.net/wiki/spaces/FPS/pages/1845396477/Microservice+test+approach+and+repository+structure)

### Running tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker-compose run` may be customised by passing
arguments to the test script.

Examples:

```
# Run all tests
scripts/test

# Run tests with file watch
scripts/test -w
```

## CI pipeline

This service uses the [FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
