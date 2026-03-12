FROM ruby:3.3.10-slim

ENV LANG=C.UTF-8
ENV TZ=Asia/Tokyo

RUN apt-get update -qq && apt-get -y install \
    build-essential \
    libyaml-dev \
    libmariadb-dev 

WORKDIR /backend
COPY Gemfile /backend/Gemfile
COPY Gemfile.lock /backend/Gemfile.lock

RUN bundle install
COPY . /backend

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]

CMD ["rails", "server", "-b", "0.0.0.0"]