FROM php:apache

# Install required packages
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache mod_rewrite for better URL handling
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy PHP configuration
COPY --from=php:apache /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini
