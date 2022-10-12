#!/usr/bin/with-contenv bashio
set +u

export AEROBOX_PORT=$(bashio::config 'aerobox_port')
bashio::log.info "AEROBOX_PORT configured as ${AEROBOX_PORT}."
export AEROBOX_IP=$(bashio::config 'aerobox_ip')
bashio::log.info "AEROBOX_IP configured as ${AEROBOX_IP}."
export DEBUG=$(bashio::config 'debug')
bashio::log.info "DEBUG configured as ${DEBUG}."

bashio::log.info "Starting Solius bridge service."
npm run start