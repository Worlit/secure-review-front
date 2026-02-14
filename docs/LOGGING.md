# Логирование

В проекте используется кастомный логгер (`src/utils/logger.ts`).
В режиме разработки (dev) выводятся все логи, в продакшене — только Warn и Error.

## Использование:

```typescript
import logger from '@/utils/logger';

logger.info('Action performed', { data: 123 });
logger.error('Something went wrong', error);
```
