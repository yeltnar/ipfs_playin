# curl -X POST http://localhost:5001/api/v0/cid/base32?arg=12D3KooWB7Fb7GghxWizb9XN5afCs9QTXzDFDt1fmqFwnGwRG3ER

# http://${api_url}${peer_id}
curl -X POST http://localhost:5001/api/v0/dht/findpeer/12D3KooWB7Fb7GghxWizb9XN5afCs9QTXzDFDt1fmqFwnGwRG3ER | jq .Responses

curl -X POST http://localhost:5001/api/v0/swarm/disconnect?arg=/ip4/172.21.0.3/udp/4001/quic/p2p/12D3KooWB7Fb7GghxWizb9XN5afCs9QTXzDFDt1fmqFwnGwRG3ER
# curl -X POST http://localhost:5001/api/v0/swarm/disconnect?arg=/ip4/172.21.0.3/tcp/4001/p2p/12D3KooWB7Fb7GghxWizb9XN5afCs9QTXzDFDt1fmqFwnGwRG3ER
curl -X POST http://localhost:5001/api/v0/swarm/connect?arg=/ip4/70.120.122.87/udp/53100/quic/p2p/12D3KooWB7Fb7GghxWizb9XN5afCs9QTXzDFDt1fmqFwnGwRG3ER