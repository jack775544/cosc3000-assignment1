DROP TABLE IF EXISTS public.cluster_stops;

CREATE TABLE public.cluster_store (
    cluster_id SERIAL PRIMARY KEY NOT NULL,
    cluster_points GEOMETRY,
    cluster_centroid GEOMETRY,
    cluster_point_count INTEGER
);
CREATE INDEX cluster_point_multi ON cluster_store USING GIST(cluster_points);

INSERT INTO cluster_store (cluster_points, cluster_centroid, cluster_point_count) (
    SELECT clust, st_centroid(clust), st_numgeometries(clust)
    FROM (SELECT st_collectionextract(unnest(st_clusterwithin(lat_long, (SELECT avg(lat_long <-> (SELECT lat_long FROM stops t
                                                                                              ORDER BY s.lat_long <-> t.lat_long
                                                                                              LIMIT 1 OFFSET 1)) AS distance FROM stops s))), 1) AS clust
          FROM stops) foo
);

CREATE TABLE public.cluster_stops (
    clu_id INTEGER PRIMARY KEY NOT NULL,
    clu_points GEOMETRY,
    clu_centroid GEOMETRY,
    clu_pointcnt INTEGER,
    brd_cnt INTEGER,
    ali_cnt INTEGER,
    brd_avg FLOAT,
    ali_avg FLOAT
);
CREATE INDEX clu_point_multi_gist ON cluster_stops USING GIST(clu_points);

INSERT INTO cluster_stops (clu_id, clu_points, clu_centroid, clu_pointcnt, brd_cnt, ali_cnt, brd_avg, ali_avg) (
    WITH data AS (SELECT cluster_id AS clust_id, n, st_geometryn(cluster_points, n) AS geom_n
                  FROM cluster_store CROSS JOIN generate_series(1, 200) n
                  WHERE n <= st_numgeometries(cluster_points))
    SELECT cluster_id, cluster_points, cluster_centroid, cluster_point_count, SUM(brd_count), SUM(ali_count), AVG(brd_count), AVG(ali_count)
    FROM stops, cluster_store, data
    WHERE st_equals(lat_long, geom_n) AND cluster_id = clust_id
    GROUP BY cluster_id
);

DROP TABLE  public.cluster_store;