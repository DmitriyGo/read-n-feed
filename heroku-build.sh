if [ "$BUILD_APP" = "api" ]; then
    # Generate JWT secrets only if they don't exist
    if [ ! -f "secrets/jwtRS256.key" ] || [ ! -f "secrets/jwtRS256.key.pub" ]; then
        echo "JWT secrets not found. Generating new ones..."
        mkdir -p secrets
        openssl genrsa -out secrets/jwtRS256.key 2048
        openssl rsa -in secrets/jwtRS256.key -pubout -out secrets/jwtRS256.key.pub
    else
        echo "Using existing JWT secrets"
    fi
    
    # Run regular build process
    echo "Generating database schema..."
    yarn db:generate
    
    echo "Applying database migrations..."
    yarn db:migrate:deploy
    
    echo "Building API..."
    yarn build:api
else 
    echo "Invalid env detected, please set BUILD_APP"
fi