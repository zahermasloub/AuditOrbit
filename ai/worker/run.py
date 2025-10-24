import redis
from rq import Connection, Queue, Worker

from .config import Config


def main() -> None:
  redis_connection = redis.from_url(Config.REDIS_URL)
  with Connection(redis_connection):
    queue = Queue(Config.QUEUE_NAME, connection=redis_connection)
    Worker([queue]).work(with_scheduler=False)


if __name__ == "__main__":
  main()
