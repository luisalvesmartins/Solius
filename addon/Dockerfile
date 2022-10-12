ARG BUILD_FROM
FROM $BUILD_FROM
#FROM node:latest

ENV LANG C.UTF-8

ADD package.json /

RUN \
   apk add --no-cache \
       nodejs \
       npm

COPY utils.js /
COPY index.js /

RUN cd / && npm install --unsafe-perm

COPY run.sh /

RUN chmod a+x /run.sh

CMD [ "/run.sh" ]