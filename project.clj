(defproject tei_xpointer.js "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "https://github.com/hcayless/tei-xpointer.js"
  :repositories {"apache" "https://repository.apache.org/content/repositories/releases/"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [compojure "1.1.5"]
                 [ring/ring-core "1.2.0"]
                 [commons-codec/commons-codec "1.8"]]
  :plugins [[lein-ring "0.8.2"]]
  :ring {:handler tei_xpointer.handler/app}
  :profiles
  {:dev {:dependencies [[ring-mock "0.1.3"]]}}
  :resources-path "resources")
