# Project 3: refactor monolith to microservice

## steps
* refactor monolith into microservices since users vs feed are clean separated domains. They each go into their corresponding nodejs project.
* dockerize frontend, reverse-proxy, users, and feed.
* time to verify.
* 1st, I used docker-compose to test, since its required in CI/CD Travis, and it's easy to test.
* 2nd, I setup k8s deployment, service, configMap, secret for AWS EKS setup.
* one thing to be emphasize is LoadBalancer Ingress endpoint of frontend vs reverse-proxy.
  * since users/feed are internal pod, their API can only be exposed by reverse-proxy which is LoadBalancer type. After reverse-proxy-svc is up, I need to get its Ingress endpoint, and set it to frontend's environemnt.ts file, and rebuild image -> push to docker-hub, and have k8s to launch frontend.
  * config.url is used by feed & users to CORS requests from frontend. Therefore it need to updated dynamically after frontend-svc is up, and we get frontend's LoadBalancer Ingress. Then we can re-apply the configMap.yaml, and use kubectl delete pod to have k8s re-schedule a new feed/users pod to consume the configmap's new config.url.
* Really appreciate Emil M's help in knowledge forum!


## eks
* eksctl didn't cleanup all resources last time: eks-cluster-demo stack (cloudformation), and eksctl-Demo-cluster/NATGateway (NAT),, etc.
    * I tried to delete the stack, but it failed in deleting: `The vpc 'vpc-07991844397cbdef0' has dependencies and cannot be deleted. (Service: AmazonEC2; Status Code: 400; Error Code: DependencyViolation; Request ID: d6566527-86bc-4000-baac-d98ada442ffe; Proxy: null)`
    * I can't create Demo cluster due to the existing stack.
    * I had to change cluster name: Demo2
* eksctl create cluster:
```
# fxrc @ popos in ~ [22:50:30] C:1
$ eksctl create cluster \                  
--name Demo2 \
--version 1.19 \
--with-oidc \
--without-nodegroup
2021-03-08 22:58:47 [ℹ]  eksctl version 0.40.0
2021-03-08 22:58:47 [ℹ]  using region us-west-1
2021-03-08 22:58:47 [ℹ]  setting availability zones to [us-west-1a us-west-1c us-west-1a]
2021-03-08 22:58:47 [ℹ]  subnets for us-west-1a - public:192.168.0.0/19 private:192.168.96.0/19
2021-03-08 22:58:47 [ℹ]  subnets for us-west-1c - public:192.168.32.0/19 private:192.168.128.0/19
2021-03-08 22:58:47 [ℹ]  subnets for us-west-1a - public:192.168.64.0/19 private:192.168.160.0/19
2021-03-08 22:58:47 [ℹ]  using Kubernetes version 1.19
2021-03-08 22:58:47 [ℹ]  creating EKS cluster "Demo2" in "us-west-1" region with
2021-03-08 22:58:47 [ℹ]  if you encounter any issues, check CloudFormation console or try 'eksctl utils describe-stacks --region=us-west-1 --cluster=Demo2'
2021-03-08 22:58:47 [ℹ]  CloudWatch logging will not be enabled for cluster "Demo2" in "us-west-1"
2021-03-08 22:58:47 [ℹ]  you can enable it with 'eksctl utils update-cluster-logging --enable-types={SPECIFY-YOUR-LOG-TYPES-HERE (e.g. all)} --region=us-west-1 --cluster=Demo2'
2021-03-08 22:58:47 [ℹ]  Kubernetes API endpoint access will use default of {publicAccess=true, privateAccess=false} for cluster "Demo2" in "us-west-1"
2021-03-08 22:58:47 [ℹ]  2 sequential tasks: { create cluster control plane "Demo2", 2 sequential sub-tasks: { 4 sequential sub-tasks: { wait for control plane to become ready, associate IAM OIDC provider, 2 sequential sub-tasks: { create IAM role for serviceaccount "kube-system/aws-node", create serviceaccount "kube-system/aws-node" }, restart daemonset "kube-system/aws-node" }, create addons } }
2021-03-08 22:58:47 [ℹ]  building cluster stack "eksctl-Demo2-cluster"
2021-03-08 22:58:48 [ℹ]  deploying stack "eksctl-Demo2-cluster"
2021-03-08 22:58:48 [ℹ]  waiting for CloudFormation stack "eksctl-Demo2-cluster"
.....
2021-03-08 23:10:44 [ℹ]  waiting for CloudFormation stack "eksctl-Demo2-cluster"
2021-03-08 23:10:59 [ℹ]  waiting for CloudFormation stack "eksctl-Demo2-cluster"
2021-03-08 23:11:01 [ℹ]  building iamserviceaccount stack "eksctl-Demo2-addon-iamserviceaccount-kube-system-aws-node"
2021-03-08 23:11:01 [ℹ]  deploying stack "eksctl-Demo2-addon-iamserviceaccount-kube-system-aws-node"
2021-03-08 23:11:01 [ℹ]  waiting for CloudFormation stack "eksctl-Demo2-addon-iamserviceaccount-kube-system-aws-node"
2021-03-08 23:11:19 [ℹ]  waiting for CloudFormation stack "eksctl-Demo2-addon-iamserviceaccount-kube-system-aws-node"
2021-03-08 23:11:36 [ℹ]  waiting for CloudFormation stack "eksctl-Demo2-addon-iamserviceaccount-kube-system-aws-node"
2021-03-08 23:11:37 [ℹ]  serviceaccount "kube-system/aws-node" already exists
2021-03-08 23:11:37 [ℹ]  updated serviceaccount "kube-system/aws-node"
2021-03-08 23:11:37 [ℹ]  daemonset "kube-system/aws-node" restarted
2021-03-08 23:11:37 [ℹ]  waiting for the control plane availability...
2021-03-08 23:11:37 [✔]  saved kubeconfig as "/home/fxrc/.kube/config"
2021-03-08 23:11:37 [ℹ]  no tasks
2021-03-08 23:11:37 [✔]  all EKS cluster resources for "Demo2" have been created
2021-03-08 23:12:08 [ℹ]  kubectl command should work with "/home/fxrc/.kube/config", try 'kubectl get nodes'
2021-03-08 23:12:08 [✔]  EKS cluster "Demo2" in "us-west-1" region is ready
(base)
# fxrc @ popos in ~ [23:14:41]
$ kubectl cluster-info
Kubernetes master is running at https://9091644CB9FBD51CEC46A5C63F975CA1.sk1.us-west-1.eks.amazonaws.com
CoreDNS is running at https://9091644CB9FBD51CEC46A5C63F975CA1.sk1.us-west-1.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

* eksctl create nodegroup with 2 nodes in the cluster: Demo2:
```
# fxrc @ popos in ~ [23:13:57]
$ eksctl create nodegroup \
  --cluster Demo2 \
  --region us-west-1 \
  --name Demo \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 2 \
  --node-volume-size 10 \
  --ssh-access \
  --ssh-public-key udagram-vid \
  --managed
2021-03-08 23:14:33 [ℹ]  eksctl version 0.40.0
2021-03-08 23:14:33 [ℹ]  using region us-west-1
2021-03-08 23:14:34 [ℹ]  will use version 1.19 for new nodegroup(s) based on control plane version
2021-03-08 23:14:35 [ℹ]  using EC2 key pair %!q(*string=<nil>)
2021-03-08 23:14:35 [ℹ]  1 nodegroup (Demo) was included (based on the include/exclude rules)
2021-03-08 23:14:35 [ℹ]  will create a CloudFormation stack for each of 1 managed nodegroups in cluster "Demo2"
2021-03-08 23:14:36 [ℹ]  2 sequential tasks: { fix cluster compatibility, 1 task: { 1 task: { create managed nodegroup "Demo" } } }
2021-03-08 23:14:36 [ℹ]  checking cluster stack for missing resources
2021-03-08 23:14:36 [ℹ]  cluster stack has all required resources
2021-03-08 23:14:36 [ℹ]  building managed nodegroup stack "eksctl-Demo2-nodegroup-Demo"
2021-03-08 23:14:36 [ℹ]  deploying stack "eksctl-Demo2-nodegroup-Demo"
2021-03-08 23:14:36 [ℹ]  waiting for CloudFormation stack "eksctl-Demo2-nodegroup-Demo"
.....

```