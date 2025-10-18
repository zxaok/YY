# Dockerfile
FROM php:8.1-cli

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . /app

# 暴露默认端口（只是说明，实际由 RailWay 提供）
EXPOSE 8080

# 使用内置 PHP server，监听 $PORT（Railway 会注入 PORT 环境变量）
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} -t /app"]
