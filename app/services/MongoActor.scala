package services

import akka.actor._
import com.typesafe.config.ConfigFactory
import models.BadCar
import org.slf4j.LoggerFactory
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.{MongoConnection, MongoDriver}
import scala.concurrent.ExecutionContext.Implicits.global

class MongoActor extends Actor with ActorLogging {

  val logger = LoggerFactory.getLogger(this.getClass)
  val conf = ConfigFactory.load()

  def db = {
    val driver = new MongoDriver
    val uri = MongoConnection.parseURI(System.getenv("MONGOHQ_URL")).get
    val connection: MongoConnection = driver.connection(uri)
    connection(uri.db.get)
  }
  def collection: JSONCollection = db.collection[JSONCollection]("badcars")

  override def receive: Receive = {
    //Запрос списка форумов для поиска
    case cars: Array[BadCar] => {
      logger.debug("Got cars list for insert")
      cars.foreach(collection.insert(_))
    }

    case "Shutdown" =>
      log.debug("Mongo actor shutdowns")
      context.stop(self)
      context.system.shutdown()
  }
}
