build:
	yarn build

build_docker_image:
	docker build -t trader:latest .

start_swarm: build_docker_image
	docker stack deploy trader -c swarm.yaml

stop_swarm:
	docker stack rm trader
