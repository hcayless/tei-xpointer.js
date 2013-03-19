(defproject dll "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.5.0"]
                 [compojure "1.1.5"]
                 [ring/ring-core "1.2.0-beta1"]]
  :plugins [[lein-ring "0.8.2"]]
  :ring {:handler dll.handler/app}
  :profiles
  {:dev {:dependencies [[ring-mock "0.1.3"]]}}
  :resources-path "resources")
