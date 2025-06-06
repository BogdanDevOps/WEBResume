import asyncio
import telegram

async def get_updates():
    bot = telegram.Bot("7426618022:AAF1awnWsXviu22F6AkB6we4GdDFFibuMvI")
    print("Получаем обновления от Telegram...")
    try:
        updates = await bot.get_updates()
        if updates:
            for update in updates:
                print(f"Update ID: {update.update_id}")
                if update.message:
                    print(f"Chat ID: {update.message.chat.id}")
                    print(f"From: {update.message.from_user.first_name} {update.message.from_user.last_name}")
                    print(f"Username: @{update.message.from_user.username}")
                    print(f"Text: {update.message.text}")
        else:
            print("Нет обновлений. Отправьте сообщение боту и попробуйте снова.")
    except Exception as e:
        print(f"Ошибка: {e}")

if __name__ == "__main__":
    asyncio.run(get_updates()) 