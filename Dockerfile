FROM php:apache

# Install mysqli and other extensions if needed
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli
