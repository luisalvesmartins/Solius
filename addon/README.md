# Solius Bridge (beta)

Solius Bridge for Home Assistant, connects with your Solius devices.
Currently only for Aerobox connected by ModBus using a Modbus to TCP adapter

This is a community effort, not an official integration.
In active development.

## Installation

1. In Home Assistant go to `Settings` > `Add-ons` > `Add-on Store` > top right dots > `Repositories` and add the repository URL `https://github.com/luisalvesmartins/solius`.
2. Click on `INSTALL` and wait for a few min, as Docker container with NodeJS webservice is built locally.
3. Configure the IP and Port of the Aerobox TCP adapter
4. Click on `START` after enabling `Watchdog` and optionally `Auto update`. Click on `LOGS` and `REFRESH` to see everything is working as expected.

## Sensor

Add the following to `configuration.yaml` of Home Assistant and restart:

```yaml
sensor:
  - platform: rest
    name: solius_aerobox_temperature1
    resource: http://127.0.0.1:8000/aerobox_temperature1
    value_template: "{{ value_json.temp }}"
    unique_id: solius_aerobox_temperature1
    device_class: temperature
  - platform: rest
    name: solius_aerobox_temperature2
    resource: http://127.0.0.1:8000/aerobox_temperature2
    value_template: "{{ value_json.temp }}"
    unique_id: solius_aerobox_temperature2
    device_class: temperature
```

## Service

Add the following to `configuration.yaml` of Home Assistant and restart:

```yaml
rest_command:
  solius_aerobox_temperature1:
    url: http://127.0.1:8000/aerobox_temperature1
    method: POST
    payload: '{"temp": "{{ temp }}"}'
    content_type: "application/json; charset=utf-8"
  solius_aerobox_temperature2:
    url: http://127.0.1:8000/aerobox_temperature2
    method: POST
    payload: '{"temp": "{{ temp }}"}'
    content_type: "application/json; charset=utf-8"
```

## Lovelace

```yaml
type: entities
entities:
  - entity: sensor.solius_aerobox_temperature1
  - entity: sensor.solius_aerobox_temperature2
```

## Automation

To test in the Deverloper Tools, call the service as follows:

```yaml
service: rest_command.solius_aerobox_temperature2
data:
  temp: 55
```

An example for a daily automation to put temperature at 55

```yaml
alias: Turn temperature to 55 at 9am
description: ""
mode: single
trigger:
  - platform: time
    at: "09:00:00"
condition: []
action:
  - service: rest_command.solius_aerobox_temperature2
    data:
      temp: 55
mode: single
```
