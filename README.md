# Queue System

## Multiprocessing

![](demomp.gif)

## Multithreading

![](demothreaded.gif)

### How to run locally

- clone the repo
- ```
  $ cd ec500-proj3/api
  $ python -m venv venv
  $ source venv/bin/activate
  $ pip install -r requirements.txt
  $ flask run
  ```
- install and start redis on your machine
- open another terminal window and run
  - `$ celery -A app.celery worker -c 16` to use multiprocessing
  - `$ celery -A app.celery worker -P eventlet -c 16` to use multithreading
