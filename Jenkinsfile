pipeline {
    agent any

    environment {
        IMAGE_NAME   = 'todoapp-frontend'
        COMPOSE_FILE = '/opt/todoapp/frontend/docker-compose.yml'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Building branch: ${env.BRANCH_NAME} | commit: ${env.GIT_COMMIT[0..6]}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || true'
            }
        }

        stage('Test') {
            steps {
                sh '''
                    if grep -q "\\"test\\"" package.json; then
                        npm test -- --watchAll=false --passWithNoTests
                    else
                        echo "No test script found — skipping tests"
                    fi
                '''
            }
        }

        stage('Build Image') {
            steps {
                sh """
                    docker build \
                        -t ${IMAGE_NAME}:latest \
                        -t ${IMAGE_NAME}:${env.GIT_COMMIT[0..6]} \
                        .
                """
            }
        }

        stage('Deploy') {
            steps {
                sh "docker compose -f ${COMPOSE_FILE} up -d --remove-orphans"
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for frontend container to start..."
                    sleep 5
                    STATUS=$(docker inspect --format="{{.State.Status}}" todoapp-frontend 2>/dev/null || echo "unknown")
                    if [ "$STATUS" = "running" ]; then
                        echo "Frontend container is running!"
                    else
                        echo "Frontend container status: $STATUS"
                        docker logs todoapp-frontend --tail 20
                        exit 1
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Frontend pipeline succeeded — deployed commit ${env.GIT_COMMIT[0..6]}"
        }
        failure {
            echo "❌ Frontend pipeline failed — check console output above"
            sh 'docker logs todoapp-frontend --tail 50 || true'
        }
        always {
            // Clean up node_modules to keep Jenkins workspace lean
            sh 'rm -rf node_modules || true'
        }
    }
}
