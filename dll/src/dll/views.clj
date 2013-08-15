(ns dll.views
  (:require [clojure.java.io :as io]
            [ring.util.response :as response])
  (:use [ring.util.time :only (format-date)]
        [hiccup core page])
  (:import [java.io BufferedInputStream File FileInputStream InputStream]
           [java.nio.charset Charset]
           [java.util Date]
           [java.net URL]))
  

(def teibpxsl "\n<?xml-stylesheet type=\"text/xsl\" href=\"/xslt/teibp.xsl\"?>")
(def teibpxslarr (.getBytes teibpxsl (Charset/forName "UTF-8")))

(defn splash-page
  []
  (html5
      [:head
        [:title "Hello World"]
        (include-css "/css/custom.css")]
      [:body
        [:h1 "Hello World"]
        [:div 
          [:p "This demo takes some sample TEI XML files (from the Thilo and Hagen edition of Servius's commentary on Vergil's Aeneid) and uses a modified TEI Boilerplate stylesheet to wrap them in a mocked-up annotation system that uses the " [:a {:href "https://docs.google.com/document/d/1JsMA-gOGrevyY-crzHGiC7eZ8XdV5H_wFTlUGzrf20w"} "draft TEI Pointer spec"] ". Some example URLs are listed below."]
          [:ul
            [:li [:a {:href "/cts/dll/Servius.Aeneid/1"} " The first bit of Servius."] " " 
                 [:a {:href "/cts/dll/Servius.Aeneid/1/xml"} "[source]"]]
            [:li [:a {:href "/cts/dll/Servius_Auctus.Aeneid/1"} " The first bit of Servius Auctus."] " "
                 [:a {:href "/cts/dll/Servius_Auctus.Aeneid/1/xml"} "[source]"]]
            [:li [:a {:href "/cts/dll/Servius.Aeneid/1#string-index(//div[@n='5']//seg[@n='1'],34)"} 
                 " A point in the first comment on line 5."]]
            [:li [:a {:href "/cts/dll/Servius.Aeneid/1#match(//div[@n='1']//seg[@n='1'],'disserunt')"} 
                 " A match on the word 'disserunt' in the first comment on line 1."]]
            [:li [:a {:href "/cts/dll/Servius.Aeneid/1#match(//div[@n='1']//seg[@n='5'],'Iuvenalis et flammis'],')"} 
                 " A match that crosses element boundaries."]]
            [:li [:a {:href "/cts/dll/Servius.Aeneid/1#string-range(//div[@n='1']//seg[@n='5'],167,20)"} 
                 " An equivalent string-range that crosses element boundaries."]]
            [:li [:a {:href "/cts/dll/Servius.Aeneid/1#right(//div[@n='2']//seg[@n='1']/hi)"} 
                 " Insertion to the right of the first &lt;hi> element in line 2."]]]]]))

(defn- file-content-length
  [resp file]
  (response/header resp "Content-Length" (+ (.length file) (alength teibpxslarr))))
  
(defn- file-last-modified
  [resp file]
  (response/header resp "Last-Modified" (format-date (Date. (.lastModified file)))))

(defn- bp-inputstream
  [in]
  (let [firstread (atom true)]
    (proxy [BufferedInputStream] [in]
      (read [& args] 
        (cond (= (count args) 1)
                (if @firstread
                  (let [c (.read in (first args) 0 (- (alength (first args)) (alength teibpxslarr)))
                        chunk (String. (first args) 0 (- (alength (first args)) (alength teibpxslarr)) (Charset/forName "UTF-8"))]
                    (when (> (.indexOf chunk "?>") -1)
                      (System/arraycopy (.getBytes (str (.substring chunk 0 (+ (.lastIndexOf chunk "?>") 2)) 
                                                        teibpxsl
                                                        (.substring chunk (+ (.lastIndexOf chunk "?>") 2))))
                                        0 (first args) 0 (alength (first args)))
                      (swap! firstread false?))
                    (alength (first args)))
                  (.read in (first args)))
              (= (count args) 3)
                (if @firstread
                  (let [c (.read in (first args) (second args) (- last args (alength teibpxslarr) ))
                        chunk (String. (first args) 0 (- (alength (first args)) (alength teibpxslarr)) (Charset/forName "UTF-8"))]
                    (when (> (.indexOf chunk "?>") -1)
                      (System/arraycopy (.getBytes (str (.substring chunk 0 (+ (.lastIndexOf chunk "?>") 2)) 
                                                        teibpxsl
                                                        (.substring chunk (+ (.lastIndexOf chunk "?>") 2))))
                                        0 (first args) 0 (last args))
                      (swap! firstread false?))
                    c)
                  (.read in (first args) (second args) (last args))))))))

(defn bp-file-response
  [path & [options]]
  (let [path (-> (str (:root options "") "/" path)
                   (.replace "//" "/")
                   (.replaceAll "^/" ""))]
      (if-let [resource (io/resource path)]
        (let [file (io/as-file resource)
              in (bp-inputstream (FileInputStream. file))]
              ;(println (.toString file))
          (-> (response/response in)
              (file-content-length file)
              (file-last-modified file))))))

