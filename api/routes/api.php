<?php

declare(strict_types=1);

// Format: [HTTP method, pola path (regex), nama fungsi handler]
return [
    ['GET',  '#^/health$#',            'handleHealth'],
    ['GET',  '#^/kategori$#',          'handleKategoriIndex'],
    ['GET',  '#^/obat$#',              'handleObatIndex'],
    ['POST', '#^/obat$#',              'handleObatStore'],
    ['GET',  '#^/obat/(\d+)$#',        'handleObatShow'],
    ['GET',  '#^/antrean/ringkasan$#', 'handleAntreanRingkasan'],
];