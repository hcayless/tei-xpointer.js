(ns dll.handler
  (:use [compojure.core]
        [dll.views])
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [compojure.response :as response]
            [ring.util.response :as resp]))

(defroutes app-routes
  (GET "/" [] (splash-page))
  (GET "/cts/dll/:author.:work/:section" 
    [author work section] (bp-file-response (str author "_" work "." section ".1-13.xml") {:root "public"}))
  (GET "/cts/dll/:author.:work/:section/xml" 
    [author work section] (resp/resource-response (str author "_" work "." section ".1-13.xml") {:root "public"}))
  (route/resources "/")
  (route/not-found "No."))

(def app
  (-> (handler/site app-routes)))
