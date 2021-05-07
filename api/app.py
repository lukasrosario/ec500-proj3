from flask import Flask, request
from flask_socketio import SocketIO, join_room
from celery import Celery, group
import time
import uuid

app = Flask(__name__, static_folder="./build", static_url_path="/")
app.config.update(
    CELERY_BROKER_URL="redis://localhost:6379",
    CELERY_RESULT_BACKEND="redis://localhost:6379",
)
celery = Celery(app.name, broker=app.config["CELERY_BROKER_URL"])
celery.conf.update(app.config)

socketio = SocketIO(app, message_queue="redis://localhost:6379")


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


@socketio.on("task")
def start_task():
    tic = time.time()
    jobs = group([long_task.s(i) for i in range(4)])
    async_res = jobs.apply_async()
    result = async_res.get()
    toc = time.time()
    time_elapsed = round(toc - tic, 3)
    socketio.emit("finished", {"timeElapsed": time_elapsed})


@celery.task()
def long_task(id):
    tid = str(uuid.uuid4())[:8]
    socketio = SocketIO(message_queue="redis://localhost:6379")
    timer = 10 ** 6
    while timer >= 0:
        if timer % 100000 == 0:
            socketio.emit("timer", {"timer": timer, "tid": tid})
        timer -= 1
    return id


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", debug=True, port=80)